/** Middleware for handling req authorization for routes. */
import jwt from "jsonwebtoken";
import {SECRET_KEY} from "../config.js";


/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    const token = req.session.token || req.headers.authorization.split(" ")[1];
    // const token = req.session.token;

    if (!token) {
      // Redirect to login if token is missing
      return res.redirect('/auth/login');
    }
    // Verify the token and attach the user payload to the request
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload; 
    return next();
  } catch (err) {
    return res.redirect('/auth/login');
  }
}

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}



export{authenticateJWT, ensureLoggedIn, ensureCorrectUser};