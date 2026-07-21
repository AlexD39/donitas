import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Ingresa un correo válido.")
    .max(160)
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "La contraseña debe contener al menos 8 caracteres.")
    .max(128, "La contraseña es demasiado larga."),
});

export type LoginInput = z.infer<typeof loginSchema>;