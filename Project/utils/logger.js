import { createLogger, transports, format } from "winston";

//config logger
const logger = createLogger({
  level: "info", // default level
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    //errores y registro de eventos
    new transports.File({ filename: "logs/app.log" }),
  ],
});

//Personalizar los mensajes
export default logger;
