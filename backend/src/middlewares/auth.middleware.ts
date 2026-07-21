import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { verifySessionToken } from "../utils/jwt.js";

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const token = request.cookies?.[env.AUTH_COOKIE_NAME];

  if (!token || typeof token !== "string") {
    response.status(401).json({
      message: "Debes iniciar sesión.",
    });

    return;
  }

  try {
    const payload = verifySessionToken(token);
    const usuarioId = Number(payload.sub);

    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      response.status(401).json({
        message: "La sesión no es válida.",
      });

      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: usuarioId,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
      },
    });

    if (!usuario || !usuario.activo) {
      response.clearCookie(env.AUTH_COOKIE_NAME);

      response.status(401).json({
        message: "La sesión expiró o el usuario está deshabilitado.",
      });

      return;
    }

    request.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    next();
  } catch {
    response.clearCookie(env.AUTH_COOKIE_NAME);

    response.status(401).json({
      message: "La sesión no es válida o ya expiró.",
    });
  }
}

export function requireAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (!request.usuario || request.usuario.rol !== "ADMIN") {
    response.status(403).json({
      message: "No tienes permisos para realizar esta acción.",
    });

    return;
  }

  next();
}