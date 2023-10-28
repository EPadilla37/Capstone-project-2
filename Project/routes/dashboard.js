import express from "express";
const dashboardRouter = express.Router();
import { dashboardObject } from "../controllers/dashboardController.js";
import pdfController from "../controllers/pdfController.js";

const dashboardController = dashboardObject;

dashboardRouter.get("/", dashboardController.render);
dashboardRouter.get("/perfil", dashboardController.getUser);
dashboardRouter.put(
  "/updateProfile/:idPersona",
  dashboardController.updatePersona
);
dashboardRouter.get("/expediente", dashboardController.getExpediente);
dashboardRouter.get(
  "/getFilteredPatientData",
  dashboardController.getFilteredPatientData
);
dashboardRouter.get(
  "/expedienteTable",
  dashboardController.getExpedienteDataJSON
);
dashboardRouter.get("/agendar", dashboardController.agendar);

dashboardRouter.post("/generar-reporte", pdfController.getMedicalReportPDF);

dashboardRouter.get("/contacto", dashboardController.getContact);
dashboardRouter.post("/sendMessage", dashboardController.sendContactMessage);

dashboardRouter.get("/configuracion", dashboardController.getConfiguracion);

export { dashboardRouter };
