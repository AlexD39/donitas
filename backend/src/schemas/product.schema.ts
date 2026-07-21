import { z } from "zod";

const nullableText = (maximum: number) =>
  z.union([
    z.string().trim().max(maximum),
    z.null(),
  ]);

const productFields = {
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe contener al menos 2 caracteres.")
    .max(120),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .optional(),

  descripcionCorta: nullableText(220).optional(),

  descripcion: nullableText(5000).optional(),

  ingredientes: nullableText(3000).optional(),

  presentacion: nullableText(120).optional(),

  precio: z.coerce
    .number()
    .finite()
    .nonnegative("El precio no puede ser negativo.")
    .max(999999.99),

  imagen: nullableText(500).optional(),

  disponible: z.boolean().optional(),

  destacado: z.boolean().optional(),

  categoriaId: z
    .union([
      z.coerce.number().int().positive(),
      z.null(),
    ])
    .optional(),
};

export const createProductSchema = z.object(productFields);

export const updateProductSchema = z
  .object(productFields)
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message:
        "Debes proporcionar al menos un campo para actualizar.",
    },
  );

export const productIdSchema = z.coerce
  .number()
  .int()
  .positive("El identificador no es válido.");