import { promisify } from "util";
import { db_usuarios, db_agenda } from "../db.js";
const db_usuarios_query = promisify(db_usuarios.query).bind(db_usuarios);
const db_agenda_query = promisify(db_agenda.query).bind(db_agenda);
import { alertsBS } from "../utils/alerts.js";

class Agenda {
  static async getModalidad() {
    const result = await db_agenda_query(
      "SELECT mod_descripcion, mod_id_modalidad FROM modalidades"
    );
    if (result.length > 0) {
      return result;
    } else {
      return;
    }
  }

  static async getSalasActivas() {
    const result = await db_agenda_query(
      "SELECT sal_id_sala, sal_id_gabinete, sal_numero, sal_descripcion, sal_activo,  sal_prefijo, sal_status FROM salas WHERE sal_online=1 ORDER BY sal_numero"
    );
    if (result.length > 0) {
      return result;
    } else {
      return;
    }
  }

  static async getEstudio(id) {
    const result = await db_agenda_query(`
        SELECT e.est_id_estudio, e.est_descripcion, e.est_precio, e.est_duracion
        FROM estudios e
        JOIN modalidades m ON e.est_id_modalidad = m.mod_id_modalidad
        WHERE m.mod_id_modalidad = "${id}"
    `);
    return result;
  }

  static async getEstudioByID(id) {
    const result = await db_agenda_query(`
        SELECT e.est_id_estudio as id, e.est_descripcion as descripcion, e.est_precio as precio, e.est_duracion as duracion, e.est_id_modalidad as id_modalidad
        FROM estudios e
        WHERE e.est_id_estudio = "${id}"
    `);
    return result[0];
  }

  static async getEstudiosDisponibles(id) {
    const qs = `SELECT e.est_id_estudio, e.est_descripcion, e.est_precio, e.est_duracion
    FROM estudios e
    JOIN salas s ON e.est_id_sala = s.sal_id_sala
    WHERE s.sal_id_sala = "${id}"`;
    const result = await db_agenda_query(qs);
    return result;
  }

  static async getCitasActivas(fecha, salaID) {
    const qs = `
      SELECT age_id_cita AS id, age_fecha AS fecha,
        age_hora_inicio AS hora_inicio, (SELECT hor_posicion FROM horas WHERE age_hora_inicio = hor_hora) AS pos_inicio,
        age_hora_final AS hora_final, (SELECT hor_posicion FROM horas WHERE age_hora_final = hor_hora) AS pos_final,
        age_duracion AS duracion, age_status AS status
      FROM 
        agenda
      WHERE 
        age_status > 0 AND age_fecha = ? AND age_id_sala = ?
      ORDER BY 
        age_hora_inicio`;

    try {
      const result = await db_agenda_query(qs, [fecha, salaID]);
      if (result.length > 0) {
        return result;
      } else {
        console.error("getCitasActivas returned an empty result.");
        return []; // Return an empty array or handle this case as needed.
      }
    } catch (error) {
      console.error("Error al obtener citas activas:", error);
      throw error;
    }
  }

  static async getIndicaciones(estudios) {
    //console.log("Inside getIndicaciones function");
    const indicacionesPromises = estudios.map(async (estudio) => {
      const qs = `
        SELECT ind_url FROM indicaciones WHERE ind_clave = ?`;

      try {
        const result = await db_agenda_query(qs, estudio);
        return result;
      } catch (error) {
        console.error("Error al obtener url de indicaciones", error);
        return null;
      }
    });

    try {
      const indicacionesUrls = await Promise.all(indicacionesPromises);
      //console.log(`indicacionesurl: ${JSON.stringify(indicacionesUrls)}`);
      return indicacionesUrls.filter((url) => url !== null); // Filter out any null values
    } catch (error) {
      console.error("Error al obtener urls de indicaciones", error);
      return [];
    }
  }

  static async getHorasActivas(limitHour) {
    const result = await db_agenda_query(
      `SELECT h.hor_posicion, h.hor_hora FROM horas h WHERE h.hor_posicion <= ${limitHour} ORDER BY h.hor_posicion`
    );
    const horasObj = { horas: result };

    return horasObj;
  }

  static async newCita(cita) {
    let citaId = null;

    try {
      //Iniciar una transaccion
      await db_agenda_query("START TRANSACTION");

      const qs = `
      INSERT INTO agenda (
        age_fecha,
        age_hora_inicio,
        age_hora_final,
        age_duracion,
        age_id_paciente,
        age_id_medico,
        age_id_sala,
        age_id_clinica,
        age_fecha_agendada,
        age_id_usuario,
        age_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        cita.fecha,
        cita.horaInicio,
        cita.horaFinal,
        cita.duracion,
        cita.paciente,
        cita.medico,
        cita.sala,
        cita.clinica,
        cita.fechaRegistro,
        cita.usuario_reg,
        1, // 1 === Agendado *verde
      ];

      // Realiza la inserción y obtiene el ID autoincremental de la cita
      const result = await db_agenda_query(qs, values);
      citaId = result.insertId;

      // Actualiza el campo de ID de Orden con el valor de la cita ID
      await db_agenda_query(
        "UPDATE agenda SET age_orden = ? WHERE age_id_cita = ?",
        [citaId, citaId]
      );

      // Registrar los estudios en procedimientos
      const estudios = cita.estudios;
      if (estudios && estudios.length > 0) {
        //console.log("Estudios en Session");
        for (const estudio of estudios) {
          //registrar estudio
          //console.log(estudio);
          Agenda.addProcesoByIDCita(citaId, estudio.id);
        }
      }

      // Confirma la transacción
      await db_agenda_query("COMMIT");

      const successAlert = alertsBS.createAlert(
        "info",
        "Cita registrada exitosamente.",
        "Por favor, confirme la cita para continuar."
      );

      return {
        status: 200,
        mensaje: successAlert,
        citaId,
      };
    } catch (error) {
      // Realiza un rollback en caso de error
      await db_agenda_query("ROLLBACK");

      const errorAlert = alertsBS.createAlert(
        "danger",
        "Error",
        "Hubo un error al registrar la cita"
      );

      return {
        status: 500,
        mensaje: errorAlert,
      };
    }
  }

  static async addProcesoByIDCita(idCita, idEstudio) {
    try {
      const qs = `INSERT INTO procesos (pro_id_cita, pro_id_estudio, pro_id_tecnico)
      VALUES (?, ?, ?)`;

      const values = [
        idCita,
        idEstudio,
        " ", //Default " ", *verificar si puede cambiarse por NULL en la BD
      ];

      const result = await db_agenda_query(qs, values);

      // Verifica si la inserción fue exitosa
      if (result.affectedRows === 1) {
        return { status: 200, message: "success" };
      } else {
        return { status: 500, message: "error" };
      }
    } catch (error) {
      error.title = "Error al insertar el proceso.";
      throw error;
    }
  }

  static async confirmCitaByID(idCita) {
    try {
      const sql = `UPDATE agenda
               SET age_confirmacion = 1 WHERE age_id_cita = ?`;
      const result = await db_agenda_query(sql, idCita);

      if (result.affectedRows == 1) {
        return { status: 200, message: "success" };
      } else {
        return { status: 500, message: "error" };
      }
    } catch (error) {
      error.title = "Cita confirmada correctamente.";
      throw error;
    }
  }

  static async cancelCitaByID(idCita) {
    try {
      const sql = `UPDATE agenda
               SET age_status = 0 WHERE age_id_cita = ?`;
      const result = await db_agenda_query(sql, idCita);

      if (result.affectedRows == 1) {
        return { status: 200, message: "success" };
      } else {
        return { status: 500, message: "error" };
      }
    } catch (error) {
      error.title = "Cita cancelada correctamente.";
      throw error;
    }
  }

  static async addCancelacionByID(idCita) {
    try {
      const values = [
        idCita,
        247, // ID 247 clubimaxess :: Usuario Default
        "Cita no confirmada",
      ];

      const sql = `INSERT INTO cancelaciones (can_id_cita, can_id_usuario, can_fecha, can_descripcion)
      VALUES (?, ?, CURDATE(), ?)`;
      const result = await db_agenda_query(sql, values);

      if (result.affectedRows === 1) {
        return { status: 200, message: "success" };
      } else {
        return { status: 500, message: "error" };
      }
    } catch (error) {
      error.title = "Cita cancelada correctamente.";
      throw error;
    }
  }

  static async getURLIndicacionesDB(strClave) {
    try {
      const query =
        "SELECT ind_url FROM indicaciones WHERE ind_clave = ? AND ind_status = 1";

      const result = await db_agenda_query(query, strClave);

      if (result.length > 0) {
        return result[0].ind_url;
      } else {
        return "NA";
      }
    } catch (error) {
      error.title = "Error al obtener indicaciones.";
      throw error;
    }
  }
}

export { Agenda };
