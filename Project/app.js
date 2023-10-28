import express from "express";
import path from "path";
import nunjucks from "nunjucks";
import session from "express-session";
import url from "url";
import { authenticateJWT } from "./middleware/auth.js";
import { router as authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { agendaRouter } from "./routes/agenda.js";
import { citaRouter } from "./routes/cita.js";
import MySQLStoreFactory from "express-mysql-session";

const MySqlStore = MySQLStoreFactory(session);
import { dbUsers } from "./db.js";
const sessionStore = new MySqlStore(dbUsers);

import { errorHandler } from "./middleware/errorHandler.js";

// Importar las funciones de filtro nj
import njFilters from "./utils/nj.filters.js";

const app = express();

//sha256 ===> imaxess2023
app.use(
  session({
    secret: "0a096633595016e7abb62982a2c64d52ac7fc323742267d51977e449e91e973e",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

var env = nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "{%",
    blockEnd: "%}",
    variableStart: "{{",
    variableEnd: "}}",
    commentStart: "{#",
    commentEnd: "#}",
  },
  watch: true,
});
//filtros ** agregar mas en /utils/nj.filters.mjs
env.addFilter("formatoMoneda", njFilters.formatoMoneda);
env.addFilter("formatoFecha", njFilters.formatoFecha);
env.addFilter("formatoHoraMinutos", njFilters.formatoHoraMinutos);
env.addFilter("formatoHora12Horas", njFilters.formatoHora12Horas);

app.use(express.static("public"));

app.use(
  "/public/js",
  express.static("public/js", {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.locals.user = req.session.user; // Esto hace que "user" esté disponible globalmente
  next();
});

app.get("/", (req, res) => {
  res.render("login/login.html");
});

app.use("/auth", authRouter);
app.use(authenticateJWT);
app.use("/dashboard", dashboardRouter);
app.use("/logout", authRouter);
app.use("/agenda", agendaRouter);
app.use("/cita", citaRouter);

app.use((req, res, next) => {
  const error = new Error("La página que estás buscando no se encuentra.");
  error.status = 404;
  error.title = "Oops! Lo sentimos";
  next(error);
});

app.use(errorHandler); //manejo de errores

export { app };
