import logger from "../utils/logger.mjs";

const errorHandler = (error, req, res, next) => {
  if (!error) {
    return next(); // No hay error
  }

  let status = error.status || 500; //500 Defaullt
  let message = error.message || "Error desconocido";
  let title = error.title || "Error Interno";

  // Manejo de errores específicos de la base de datos (MySQL)
  if (error instanceof Error && error.code === "ER_BAD_FIELD_ERROR") {
    status = 400; // Campo incorrecto
    message = "Error en los datos enviados. Verifique los campos.";
    title = "Error de validación de datos";
  } else if (error instanceof Error && error.code === "ER_DUP_ENTRY") {
    status = 409; // Conflicto, entrada duplicada
    message = "Ya existe un registro con estos datos.";
    title = "Duplicación de datos";
  } else if (
    error instanceof Error &&
    error.code === "ER_ACCESS_DENIED_ERROR"
  ) {
    status = 401; // No autorizado
    message = "No tiene permiso para acceder a esta página o recurso.";
    title = "Acceso denegado";
  } else if (
    error instanceof Error &&
    (error.code === "ER_PARSE_ERROR" || error.code === "ER_SYNTAX_ERROR")
  ) {
    status = 400; // Solicitud incorrecta debido a un error de sintaxis
    message = "La solicitud contiene errores de sintaxis.";
    title = "Error de sintaxis en la solicitud";
  } else if (error instanceof Error && error.code === "ECONNREFUSED") {
    status = 500; // Conexión rechazada
    message = "Conexión rechazada a la base de datos.";
    title = "Error en BD";
  } else if (error instanceof Error && error.code === "ER_BAD_NULL_ERROR") {
    status = 400; // Puedes ajustar el código de estado según tus necesidades
    message = "Uno o más campos requeridos no pueden ser nulos.";
    title = "Error de campos nulos";
  }

  let username = "";
  console.log(req.headers.referer);
  const referrer = req.headers.referer || "/dashboard/";
  if (req.session.user && req.session.user.usuario) {
    username = req.session.user.usuario;
  } else {
    username = "SysLogin";
  }

  let customMessage = ""; // Mensaje personalizado
  // Agregar mensajes personalizados según el código de estado
  if (status === 400) {
    customMessage =
      "La solicitud es incorrecta.\nVerifique los datos enviados.";
  } else if (status === 401) {
    customMessage =
      "No está autorizado para acceder a esta página.\nInicie sesión o proporcione credenciales válidas.";
  } else if (status === 403) {
    customMessage = "No tiene permisos para acceder a esta página o recurso.";
  } else if (status === 404) {
    customMessage =
      "La página o recurso que está buscando no se encuentra en el servidor.";
  } else if (status === 500) {
    customMessage =
      "Ocurrió un error interno en el servidor.\nPor favor, inténtelo de nuevo más tarde o póngase en contacto con el soporte técnico.";
  } else if (status === 666) {
    customMessage = message; // por si se ocupa mandar un message especifico
  }

  const customTitle = error.title || title;

  logger.error({ username, message, referrer }); // Logger file

  res.status(status).render("partials/error.html", {
    customTitle,
    message,
    status,
    referrer,
    customMessage,
  });
};

export { errorHandler };
