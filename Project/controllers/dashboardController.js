import { User } from "../models/user.js";
import { Expediente } from "../models/expediente.js";
import { promisify } from "util";
import { SECRET_KEY } from "../config.js";
import { error } from "console";
import nunjucks from "nunjucks";
import { db_usuarios } from "../db.js";
import session from "express-session";
import { throws } from "assert";
import { alertsBS } from "../utils/alerts.js";
import { sendEmail } from "../utils/fn.nodemailer.js";
import { constrainedMemory } from "process";

const db_usuarios_query = promisify(db_usuarios.query).bind(db_usuarios);

const dashboardObject = {
  render: async (req, res, next) => {
    try {
      // const username = req.user.username; // Extracted from the verified token in middleware
      const result = req.session.user;
      return res.render("dashboard.html", { result, selected: "dashboard" });
    } catch (err) {
      return next(err);
    }
  },

  //fill de perfil
  getUser: async (req, res, next) => {
    try {
      //console.log(req.session.user);
      if (req.session.user) {
        const result = req.session.user;
        return res.render("perfil.html", { result, selected: "perfil" });
      } else {
        const error = new Error("Error al obtener el perfil del usuario.");
        error.status = 500;
        next(error);
        console.log("ERROR FETCHING USER PROFILE error ");
      }
    } catch (err) {
      return next(err);
    }
  },

  getFilteredPatientData: async (req, res, next) => {
    try {
      const idReferencia = req.session.user.idReferencia;
      const { searchTerm } = req.query;
      if (idReferencia) {
        const result = await Expediente.getFilteredPatientData(
          idReferencia,
          searchTerm
        );
        const formattedResult = result.map((item) => ({
          ...item,
          fecha: new Date(item.fecha).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          fullName: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`,
        }));
        res.json(formattedResult);
      } else {
        console.log("ERROR FETCHING USER PROFILE :: getExpediente");
      }
    } catch (err) {
      return next(err);
    }
  },

  //Update persona ( Direccion e Informacion)
  updatePersona: async (req, res, next) => {
    try {
      const { idPersona } = req.params;
      const { txtDireccion, txtDescripcion } = req.body;
      const response = await User.updateProfile(
        idPersona,
        txtDireccion,
        txtDescripcion
      );

      if (response.status == 200) {
        req.session.user.direccion = txtDireccion.trim();
        req.session.user.informacion = txtDescripcion.trim();
        const successAlert = alertsBS.createAlert(
          "success",
          "¡Éxito!",
          "Perfil actualizado exitosamente"
        );
        res.status(200).send({ status: 200, msg: successAlert });
      } else {
        const errorAlert = alertsBS.createAlert(
          "danger",
          "Error",
          "No se pudo actualizar el perfil"
        );
        res.status(500).send({ status: 500, msg: errorAlert });
      }
    } catch (err) {
      return next(err);
    }
  },

  getExpediente: async (req, res, next) => {
    try {
      const username = req.user.username;
      const idReferencia = req.session.user.idReferencia;
      if (idReferencia) {
        const result = await Expediente.getExpediente(idReferencia);
        const formattedResult = result.map((item) => ({
          ...item,
          fecha: new Date(item.fecha).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          fullName: `${item.nombre} ${item.apellido_paterno} ${item.apellido_materno}`,
        }));
        const renderedTemplate = nunjucks.render("expediente/expediente.html", {
          result: formattedResult,
          username: req.session.user.nombre,
          selected: "expediente",
        });
        return res.send(renderedTemplate);
      } else {
        console.log("ERROR FETCHING USER PROFILE :: getExpediente");
      }
    } catch (err) {
      return next(err);
    }
  },

  getExpedienteDataJSON: async (req, res, next) => {
    try {
      const username = req.user.username;
      if (username) {
        const expedienteData = await User.getExpedienteJSON();
        res.json(expedienteData);
      } else {
        console.log("ERROR FETCHING USER EXPEDIENTE");
      }
    } catch (err) {
      return next(err);
    }
  },

  agendar: async (req, res, next) => {
    try {
      const paso = req.session.paso || "paso1";
  
      switch (paso) {
        case "paso1":
          req.session.paso = paso;
          return res.render("agenda/agendar.html", { selected: "agendar" });
        case "paso2":
          return res.render("agenda/agendarEstudio.html", {
            paciente: req.session.paciente,
            selected: "agendar",
          });
        case "paso3":
          return res.render("agenda/agendarCita.html", {
            paciente,
            selected: "agendar",
          });
        default:
          console.log("Error in switch case");
      }
    } catch (err) {
      return next(err);
    }
  },
  

  getContact: async (req, res, next) => {
    try {
      if (req.session.user) {
        const result = req.session.user;
        return res.render("contacto.html", { result, selected: "contacto" });
      }
    } catch (err) {
      return next(err);
    }
  },

  sendContactMessage: async (req, res, next) => {
    try {
      let { type, title, message } = "";
      const nameEmail = req.body.contactName;
      const fromEmail = "recepcion@imaxess.com";
      const toEmail = req.body.contactEmail;
      const subjectEmail = `Contacto ClubImaxess`;
      const contactMail = req.body.contactPhone;
      const messageMail = req.body.contactMessage;

      const dataEmail = {
        name: nameEmail,
        from: fromEmail,
        to: toEmail,
        subject: subjectEmail,
        contactPhone: contactMail,
        message: messageMail,
      };

      const renderedMessage = await nunjucks.render(
        "emails/contacto_email.html",
        { email: dataEmail }
      );

      const mensaje = await sendEmail(
        fromEmail,
        toEmail,
        subjectEmail,
        renderedMessage,
        nameEmail
      );

      let sent = false; // default :: mensaje no enviado

      if (mensaje === "Success") {
        sent = true; // mensaje se envió correctamente
        type = "success";
        title = "¡Mensaje Enviado!";
        message =
          "Su mensaje se ha enviado correctamente. Nos pondremos en contacto con usted lo más pronto posible.";
      } else {
        type = "warning";
        title = "Error: Mensaje no enviado";
        message =
          "Se ha producido un error al enviar su mensaje. Por favor, inténtelo de nuevo más tarde.";
      }

      const statusCode = sent ? 200 : 500;

      const msgAlert = alertsBS.createAlert(type, title, message);
      res.status(statusCode).send({ status: statusCode, msg: msgAlert });
    } catch (err) {
      return next(err);
    }
  },

  getConfiguracion: async (req, res, next) => {
    try {
      if (req.session.user) {
        const result = req.session.user;
        return res.render("configuracion.html", {
          result,
          selected: "configuracion",
        });
      }
    } catch (err) {
      return next(err);
    }
  },
};

export { dashboardObject };
