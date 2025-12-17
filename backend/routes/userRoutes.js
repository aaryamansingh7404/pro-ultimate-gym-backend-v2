import express from "express";
import UserController from "../controller/userController.js";


const router = express.Router();

// Signup route
router.post("/signup", UserController.createUserDoc);

// Login route
router.post("/login", UserController.verifyLogin);

export default router;
