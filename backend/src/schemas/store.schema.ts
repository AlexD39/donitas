import { z } from "zod";

const optionalText = (maximum: number) =>
  z
    .union([
      z.string().trim().max(maximum),
      z.null(),
    ])
    .optional();

const optionalSocialUrl = z
  .union([
    z.string().trim().url("Debe ser una URL válida."),
    z.literal(""),
    z.null(),
  ])
  .optional();

export const updateStoreSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(120)
      .optional(),

    eslogan: optionalText(200),
    introduccion: optionalText(2000),
    descripcion: optionalText(5000),

    whatsapp: z
      .string()
      .trim()
      .min(10)
      .max(25)
      .transform((value) => value.replace(/\D/g, ""))
      .optional(),

    telefono: optionalText(25),
    direccion: optionalText(500),
    horarios: optionalText(1000),

    facebook: optionalSocialUrl,
    instagram: optionalSocialUrl,

    moneda: z
      .string()
      .trim()
      .min(2)
      .max(10)
      .transform((value) => value.toUpperCase())
      .optional(),

    mensajeWhatsapp: optionalText(1000),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo.",
  });