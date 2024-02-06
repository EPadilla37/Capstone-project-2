import express from "express";
const agendaRouter = express.Router();
import { agendaObject } from "../controllers/agendaController.js";
const agendaController = agendaObject;

agendaRouter.get("/search", agendaController.searchAll);
agendaRouter.get("/getPatientById", agendaController.getById);
agendaRouter.get("/salaActive", agendaController.salaActive);
agendaRouter.get("/modalidades", agendaController.modalidad);
agendaRouter.get("/salas", agendaController.salas);
agendaRouter.get("/estudios/:modalidadId", agendaController.estudio);
agendaRouter.get(
  "/estudiosdisponibles/:salaId",
  agendaController.estudiosDisponibles
);

agendaRouter.get(
  "/estudioSeleccionado/:estudioId",
  agendaController.getEstudioSeleccionado
);
agendaRouter.get("/agendarCita", agendaController.agendarCita);
agendaRouter.get("/getHorario", agendaController.getDisponibilidad);

agendaRouter.post("/selectStudy", agendaController.getStudy);
agendaRouter.post("/selectCita", agendaController.agendaCita);

agendaRouter.get("/getEstudio", agendaController.getEstudiosInSession);
agendaRouter.get("/clearSession", agendaController.clearAllSession);
agendaRouter.get("/addTotal", agendaController.addTotal);

agendaRouter.get("/getIndicaciones", agendaController.getIndicacionesImg);

agendaRouter.post("/addEstudio", agendaController.addEstudioToSession);
agendaRouter.post("/removeEstudio", agendaController.removeEstudioFromSession);

export { agendaRouter };
