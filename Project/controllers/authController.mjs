import { db_usuarios } from "../db.mjs";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import crypto from "crypto";
import { User } from "../models/user.mjs";
import { SECRET_KEY } from "../config.mjs";
import { error } from "console";
import { alertsBS } from "../utils/alerts.mjs";

const userModel = {
  login: async (req, res, next) => {
    try {
      let { username, password } = req.body;
      if (await User.authenticate(username, password)) {
        let token = jwt.sign({ username }, SECRET_KEY);

        //Storage user data -- session
        const userData = await User.getUser(username);
        // Store userData in session
        req.session.user = userData[0];
        // Store token in the user's session
        req.session.token = token;
        // Store token in client-side cookies
        res.cookie("authToken", token, { httpOnly: true });
        const message =
          "Acceso médico en línea, seguridad, colaboración y ventajas exclusivas.";
        const msgHtml = alertsBS.createAlert(
          "success",
          `Bienvenido a Club Imaxess ${req.session.user.nombre}`,
          message
        );
        return res.render("dashboard.html", {
          notifyMessage: msgHtml,
          username: req.session.user.nombre,
        });
      } else {
        const messageAlert =
          "Usuario o contraseña incorrectos. Por favor, verifica los datos e inténtalo nuevamente.";
        const alertHtml = alertsBS.createAlert(
          "danger",
          "Acceso Incorrecto",
          messageAlert
        );
        return res.render("login/login.html", { loginAlert: alertHtml });
      }
    } catch (err) {
      return next(err);
    }
  },

  renderLogin: async (req, res, next) => {
    res.render("login/login.html");
  },

  logout: async (req, res, next) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error(err);
        }
        res.redirect("/login"); // Redirige a la página principal o a donde desees
      });
    } catch (err) {
      return next(err);
    }
  },
};

export { userModel };
