// auth.js
import express from "express";
const router = express.Router();
import { userModel } from "../controllers/authController.js";

// Route to serve the login page
router.get("/login", userModel.renderLogin);

// Route for handling login form submission
router.post("/login", userModel.login);

router.get("/logout", userModel.logout);

export { router };
