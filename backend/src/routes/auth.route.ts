import { Router } from "express";
import { resgisterHandler } from "../controllers/auth.controller.js";

const authRoutes = Router();

// prefix: /auth
authRoutes.post("/register", resgisterHandler);

export default authRoutes;
