import express from "express";
const citaRouter = express.Router();
import { citasObject } from "../controllers/citasController.mjs";
const citaController = citasObject;

citaRouter.get(
  "/getCitasActive/:fecha/:salaID",
  citaController.getCitasActivas
);

citaRouter.get("/getCitasAgenda/:fecha", citaController.getAgendaByModality);
citaRouter.get(
  "/checkingDisponibilidad/:fecha/:hora/:duracion",
  citaController.checkingAvailability
);

citaRouter.post("/addCita", citaController.addNewCita);
citaRouter.put("/confirmCita/:idCita", citaController.confirmCita);
citaRouter.put("/cancelCita/:idCita", citaController.cancelCita);

export { citaRouter };
