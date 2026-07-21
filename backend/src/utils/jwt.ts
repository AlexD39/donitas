import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";

const issuer = "donitas-anita-api";
const audience = "donitas-anita-admin";

interface SessionUser {
  id: number;
  email: string;
  rol: "ADMIN";
}

export interface SessionPayload extends JwtPayload {
  email: string;
  rol: "ADMIN";
}

export function createSessionToken(usuario: SessionUser): string {
  return jwt.sign(
    {
      email: usuario.email,
      rol: usuario.rol,
    },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: env.JWT_EXPIRES_IN_SECONDS,
      subject: String(usuario.id),
      issuer,
      audience,
    },
  );
}

export function verifySessionToken(token: string): SessionPayload {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
    issuer,
    audience,
  });

  if (
    typeof payload === "string" ||
    !payload.sub ||
    typeof payload.email !== "string" ||
    payload.rol !== "ADMIN"
  ) {
    throw new Error("El contenido de la sesión no es válido.");
  }

  return payload as SessionPayload;
}