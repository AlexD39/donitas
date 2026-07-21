import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4001),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatoria."),

  FRONTEND_URL: z.string().url("FRONTEND_URL debe ser una URL válida."),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET debe contener al menos 32 caracteres."),

  JWT_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(7200),

  AUTH_COOKIE_NAME: z.string().min(1).default("donitas_session"),


CLOUDINARY_CLOUD_NAME: z
  .string()
  .min(1, "CLOUDINARY_CLOUD_NAME es obligatoria."),

CLOUDINARY_API_KEY: z
  .string()
  .min(1, "CLOUDINARY_API_KEY es obligatoria."),

CLOUDINARY_API_SECRET: z
  .string()
  .min(1, "CLOUDINARY_API_SECRET es obligatoria."),

CLOUDINARY_FOLDER: z
  .string()
  .min(1)
  .default("donitas-anita"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "Variables de entorno inválidas:",
    result.error.flatten().fieldErrors,
  );

  throw new Error("La configuración del backend no es válida.");
}

export const env = result.data;