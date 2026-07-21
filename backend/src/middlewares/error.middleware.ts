import type { ErrorRequestHandler } from "express";

import { AppError } from "../utils/app-error.js";

import multer from "multer";

function getPrismaErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String(
      (error as { code: unknown }).code,
    );
  }

  return null;
}

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  next,
): void => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof multer.MulterError) {
  if (error.code === "LIMIT_FILE_SIZE") {
    response.status(413).json({
      message:
        "La imagen supera el límite de 5 MB.",
    });

    return;
  }

  response.status(400).json({
    message:
      "No se pudo recibir la imagen.",
    details: error.message,
  });

  return;
}

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });

    return;
  }

  const prismaCode = getPrismaErrorCode(error);

  if (prismaCode === "P2002") {
    response.status(409).json({
      message:
        "Ya existe un registro con alguno de los datos proporcionados.",
    });

    return;
  }

  if (prismaCode === "P2025") {
    response.status(404).json({
      message: "El registro solicitado no existe.",
    });

    return;
  }

  console.error("Error no controlado:", error);

  response.status(500).json({
    message: "Ocurrió un error interno en el servidor.",
  });
};