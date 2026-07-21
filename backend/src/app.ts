import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import adminRouter from "./routes/admin.routes.js";
import authRouter from "./routes/auth.routes.js";
import publicRouter from "./routes/public.routes.js";

export const app = express();

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(cookieParser());

app.get("/api/health", async (_request, response, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    response.json({
      ok: true,
      message: "API de Donitas Anita funcionando.",
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/public", publicRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);


app.use((_request, response) => {
  response.status(404).json({
    message: "Ruta no encontrada.",
  });
});

app.use(errorHandler);