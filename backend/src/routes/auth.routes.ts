import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import {
  login,
  logout,
  me,
} from "../controllers/auth.controller.js";

import {
  requireAuth,
} from "../middlewares/auth.middleware.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Demasiados intentos de acceso. Espera unos minutos e inténtalo nuevamente.",
  },
});

router.post("/login", loginLimiter, login);
router.get("/me", requireAuth, me);
router.post("/logout", logout);

export default router;