import { User } from "../models/user.mjs";
import { Agenda } from "../models/agenda.mjs";
import session from "express-session";
import { promisify } from "util";
import { error } from "console";
import nunjucks from "nunjucks";
import { json } from "express";

import { formatString } from "../utils/format.mjs";
import { agendaRouter } from "../routes/agenda.mjs";
import { formatDate } from "../utils/dates.mjs";
import { alertsBS } from "../utils/alerts.mjs";
import { agendaObject } from "./agendaController.mjs";
import { sendConfirmationEmail } from "../utils/fn.nodemailer.mjs";

const citasObject = {
  getCitasActivas: async (req, res, next) => {
    const { fecha, salaID } = req.params;
    try {
      if (fecha && salaID) {
        const result = await Agenda.getCitasActivas(fecha, salaID);

        const citasActivasLista = result.map((row) => ({
          id: row.age_id_cita,
          fecha: row.age_fecha,
          hora_inicio: row.age_hora_inicio,
          pos_inicio: row.pos_inicio,
          hora_final: row.age_hora_final,
          pos_final: row.pos_final,
          duracion: row.age_duracion,
          status: row.age_status,
        }));
        res.json(citasActivasLista);
      } else {
        res
          .status(400)
          .json({ error: "Problema con fecha && salaID en getCitasActivas" });
      }
    } catch (err) {
      return next(err);
    }
  },

  citaToJSON: async (cita) => {
    return {
      date: cita.fecha,
      startTime: cita.hora_inicio,
      startPosition: cita.pos_inicio,
      endTime: cita.hora_final,
      endPosition: cita.pos_final,
      duration: cita.duracion,
      status: cita.status,
      active: "DISABLE",
    };
  },

  getAgendaByModality: async (req, res, next) => {
    try {
      const selectedDate = req.params.fecha;
      const idModality = req.session.modalidades.id;

      const validExpiredDate = false; //habilitar fechas y horas  anteriores a hoy

      const jsonData = {
        status: 200,
        modality: req.session.modalidades.descripcion,
        type: req.session.user.idTipoUsuario,
        date: selectedDate,
        idRef: req.session.user.idReferencia,
        schedule_time: [],
      };

      let agenda = [];
      // Estructura predeterminada para horaItem
      let infoAgenda = {
        sch_startPosition: 0,
        sch_startTime: "00:00",
        sch_endPosition: 0,
        sch_endTime: "00:15", // Cambié 0 a "00:15"
        sch_rowspan: 1,
        sch_duration: 15,
        sch_active: "ENABLE",
        sch_modality: idModality,
        sch_date: selectedDate,
        // sch_index: $modalidad, // Puedes agregar sch_index si es necesario
        sch_expired: 0,
        sch_status: -1,
      };

      //info agenda solo se usa en la estructura base del objeto agenda
      agenda = infoAgenda;

      let contHoras = 0;
      const maxHora = 48;
      let horas = [];
      const dbHoras = await Agenda.getHorasActivas(maxHora);

      for (const item of dbHoras.horas) {
        if (contHoras < maxHora) {
          const hora = item.hor_hora;

          for (let contCitas = 0; contCitas < agenda.length; contCitas++) {
            agenda[contCitas].sch_startTime = hora;
          }

          // Clonar "infoAgenda" en un nuevo objeto
          const horaItem = { ...agenda };
          horaItem.sch_startTime = hora;

          //Bloquear horas menor a actual
          const fechaHoy = new Date();
          const fechaSeleccionada = new Date(selectedDate + " " + hora);

          if (validExpiredDate) {
            if (fechaSeleccionada < fechaHoy) {
              horaItem.sch_active = "DISABLE";
              horaItem.sch_expired = 1;
            } else {
              horaItem.sch_active = "ENABLE";
              horaItem.sch_expired = 0;
            }
          }

          horaItem.sch_startPosition = contHoras;

          horas.push(horaItem);
          contHoras++;
        }
      }
      //console.log(horas);

      //Obj citas vacias
      let cont = 0;
      let objCitas = [];
      let bdCitas = [];

      if (selectedDate && idModality) {
        bdCitas = await Agenda.getCitasActivas(selectedDate, idModality);

        for (const cita of bdCitas) {
          objCitas[cont] = await citasObject.citaToJSON(cita); //JSON.stringify(cita);
          cont++;
        }
      }

      //console.log(objCitas);

      const colsSalas = {
        MAT2: "MASTOGRAFIA",
        MAT3: "RAYOS X",
        MAT6: "ULTRASONIDO",
        MAT8: "TOMOGRAFIA",
        MAT9: "RESONANCIA MAGNETICA",
        MAT11: "ORTOPANTOMOGRAFIA",
        QD01: "LABORATORIO",
      };

      for (const citaItem of objCitas) {
        const renglon = citaItem.startPosition;
        const columna = idModality;

        horas[renglon].sch_status = citaItem.status;
        horas[renglon].sch_duration = citaItem.duration;
        horas[renglon].sch_active = citaItem.active; //default DISABLE
        horas[renglon].sch_startTime = citaItem.startTime;
        horas[renglon].sch_startPosition = citaItem.startPosition;
        horas[renglon].sch_endTime = citaItem.endTime;
        horas[renglon].sch_endPosition = citaItem.endPosition;

        // Renglones que abarca la celda
        const rowspan = citaItem.duration / 15;
        horas[renglon].sch_rowspan = rowspan;

        // Marcar celdas de abajo con -1 (para no desplegarse)
        for (let c = 1; c < rowspan; c++) {
          horas[renglon + c].sch_rowspan = -1;
          horas[renglon + c].sch_active = "DISABLE";
        }
      }

      jsonData.schedule_time = horas;
      res.json(jsonData);
    } catch (error) {
      return next(error);
    }
  },

  checkingAvailability: async (req, res, next) => {
    try {
      const { fecha, hora, duracion } = req.params;
      const sala = req.session.modalidades.id;
      console.log(
        `FECHA: ${fecha}, SALA: ${sala}, HORA: ${hora}, DURACION: ${duracion}`
      );

      //comparar intervalos de 15min desde la HoraInicio hasta HoraFinalizcion
      const hrInicioMin = await citasObject.convertHourToMinutes(hora);
      const hrFinMin = parseInt(hrInicioMin) + parseInt(duracion);

      let intervaloActual = parseInt(hrInicioMin);

      const citasExistentes = await Agenda.getCitasActivas(fecha, sala);

      // Comprobar si el intervalo actual se superpone con alguna cita existente
      let citaOcupada = false;

      console.clear();

      for (const cita of citasExistentes) {
        const citaInicioMin = parseInt(
          await citasObject.convertHourToMinutes(cita.hora_inicio)
        );
        const citaFinMin = citaInicioMin + parseInt(cita.duracion);
        if (intervaloActual >= citaInicioMin && intervaloActual < citaFinMin) {
          citaOcupada = true;
        }

        /*console.log(
          `CITA:: ${cita.hora_inicio} , ${intervaloActual} >= ${citaInicioMin} && ${intervaloActual} < ${citaFinMin}, RESULT :: ${citaOcupada}`
        );*/

        // Incrementar el intervalo actual en 15 minutos
        intervaloActual += 15;
      }

      if (citaOcupada) {
        //la cita se suporpone a una existente
        res.json({ disponible: false });
      } else {
        //Aqui la funcion que guarda la cita en la BDImaxess
        res.json({ disponible: true });
      }
    } catch (error) {
      return next(error);
    }
  },

  convertHourToMinutes: async (hour) => {
    const [hh, mm] = hour.split(":");
    return parseInt(hh) * 60 + parseInt(mm);
  },

  addNewCita: async (req, res, next) => {
    try {
      const cita = {
        fecha: req.body.dateSelected,
        horaInicio: req.body.timeSelected,
        horaFinal: formatDate.addMinutesToTime(
          req.body.timeSelected,
          req.body.duration
        ),
        duracion: req.body.duration,
        paciente: req.session.paciente.id_paciente,
        medico: 1, // Se debe reemplazar por medicos propios de la clinica
        sala: req.session.modalidades.id,
        clinica: req.session.user.idReferencia,
        fechaRegistro: formatDate.getCurrentDateTime(),
        usuario_reg: 247, // ID 247 clubimaxess :: Usuario Default
        estudios: req.session.estudios,
      };

      const resultado = await Agenda.newCita(cita);

      if (resultado.status === 200) {
        //console.log("ID de la nueva cita:", resultado.citaId);
        res.json(resultado);
      } else {
        // Hubo un error al crear la cita
        console.error(resultado.error);
        res.status(resultado.status).json(resultado);
      }
    } catch (error) {
      return next(error);
    }
  },

  confirmCita: async (req, res, next) => {
    try {
      const { idCita } = req.params;
      //console.log(`confirmCita: async :: ${idCita}`);

      const response = await Agenda.confirmCitaByID(idCita);
      // console.log(response);

      if (response.status === 200) {
        const emailInfo = {
          id_cita: idCita,
          fecha_agendada: req.body.dateSelected,
          hora_cita: req.body.timeSelected,
          tel_contacto: req.session.user.mobile,
          paciente: req.session.paciente,
          modalidad: req.session.modalidades.descripcion,
          estudios: req.session.estudios,
        };

        const email = await citasObject.sendConfirmCitaByEmail(emailInfo);
        let msgEmail = "";
        if (email) {
          msgEmail = "Se envio correo de confirmación de cita.";
          console.log(msgEmail);
        }

        const successAlert = alertsBS.createAlert(
          "success",
          "¡Éxito!",
          `Cita confirmada exitosamente. ${msgEmail}`
        );
        res.send({ status: 200, msg: successAlert });
      } else {
        const errorAlert = alertsBS.createAlert(
          "danger",
          "Error",
          "No se pudo confirmar la cita."
        );
        res.send({ status: 500, msg: errorAlert });
      }
    } catch (error) {
      return next(error);
    }
  },

  sendConfirmCitaByEmail: async (info, next) => {
    try {
      //console.log(info.estudios);

      const nameEmail = "Club Imaxess - Agenda";
      const fromEmail = "recepcion@imaxess.com";
      const toEmail = "erniepad@hotmail.com"; //req.session.user.email;
      const subjectEmail = `Confirmación de Cita Agenda`;

      let estudiosInfo = [];

      //Agregar url_indicaciones
      for (const estudio of info.estudios) {
        const url = await citasObject.getUrlIndicaciones(
          estudio.id_modalidad,
          estudio.descripcion
        );
        estudio.url_indicaciones = url;
        estudiosInfo.push(estudio);
      }

      const dataConfirmEmail = {
        solicitud: info.id_cita,
        modalidad: info.modalidad,
        paciente: info.paciente,
        fecha_agendada: info.fecha_agendada,
        hora_inicio: info.hora_cita,
        tel_contacto: info.tel_contacto,
        estudios: estudiosInfo,
      };

      const renderedMessage = await nunjucks.render(
        "emails/confirmacion_cita.html",
        { confirmacion: dataConfirmEmail }
      );

      const mensaje = await sendConfirmationEmail(
        fromEmail,
        toEmail,
        subjectEmail,
        renderedMessage,
        nameEmail
      );

      if (mensaje === "Success") {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return next(err);
    }
  },

  cancelCita: async (req, res, next) => {
    try {
      const { idCita } = req.params;
      console.log(`cancelCita: async :: ${idCita}`);

      const cancelacionResult = await Agenda.cancelCitaByID(idCita);

      if (cancelacionResult.status === 200) {
        const addCancelacionResult = await Agenda.addCancelacionByID(idCita);
        if (addCancelacionResult.status === 200) {
          console.log(addCancelacionResult);
          console.log("Status :: " + cancelacionResult.message);
          const successAlert = alertsBS.createAlert(
            "success",
            "Cancelacion de cita",
            "Cita cancelada correctamente."
          );
          res.send({ status: 200, msg: successAlert });
        } else {
          const errorAlert = alertsBS.createAlert(
            "danger",
            "Error",
            "Error al agregar la cancelación."
          );
          res.send({ status: 500, msg: errorAlert });
        }
      } else {
        const errorAlert = alertsBS.createAlert(
          "danger",
          "Error",
          "No se pudo cancelar la cita."
        );
        res.send({ status: 500, msg: errorAlert });
      }
    } catch (error) {
      return next(error);
    }
  },

  getUrlIndicaciones: async (mod, desc) => {
    try {
      let strClave = `${mod}_${desc.replace(/ /g, "_")}`;

      if (strClave.startsWith("TC_ANGIO")) {
        strClave = "TC_ANGIOTOMOGRAFIA";
      }

      if (
        strClave !== "RM_CISTERNO_RESONANCIA" &&
        strClave !== "RM_COLANGIO_RESONANCIA" &&
        mod === "RM"
      ) {
        strClave = "RM_GENERAL";
      }

      const url = await Agenda.getURLIndicacionesDB(strClave);
      return url;
    } catch (err) {
      return next(err);
    }
  },
};

export { citasObject };
