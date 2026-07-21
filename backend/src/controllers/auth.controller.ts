import bcrypt from "bcryptjs";

import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { createSessionToken } from "../utils/jwt.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: env.JWT_EXPIRES_IN_SECONDS * 1000,
};

export async function login(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const validation = loginSchema.safeParse(request.body);

    if (!validation.success) {
      response.status(400).json({
        message: "Revisa los datos enviados.",
        errors: validation.error.flatten().fieldErrors,
      });

      return;
    }

    const { email, password } = validation.data;

    const usuario = await prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    const passwordValido =
      usuario && usuario.activo
        ? await bcrypt.compare(password, usuario.passwordHash)
        : false;

    if (!usuario || !usuario.activo || !passwordValido) {
      response.status(401).json({
        message: "El correo o la contraseña son incorrectos.",
      });

      return;
    }

    const token = createSessionToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    await prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        ultimoAcceso: new Date(),
      },
    });

    response.cookie(
      env.AUTH_COOKIE_NAME,
      token,
      cookieOptions,
    );

    response.json({
      message: "Sesión iniciada correctamente.",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
}

export function me(
  request: Request,
  response: Response,
): void {
  response.json({
    usuario: request.usuario,
  });
}

export function logout(
  _request: Request,
  response: Response,
): void {
  response.clearCookie(env.AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  response.json({
    message: "Sesión cerrada correctamente.",
  });
}