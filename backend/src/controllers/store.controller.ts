import type { Request, Response } from "express";

import { prisma } from "../config/prisma.js";
import { updateStoreSchema } from "../schemas/store.schema.js";
import { AppError } from "../utils/app-error.js";

function normalizeNullableText(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  const normalized = value.trim();

  return normalized === "" ? null : normalized;
}

export async function getAdminStore(
  _request: Request,
  response: Response,
): Promise<void> {
  const store = await prisma.tienda.findUnique({
    where: {
      id: 1,
    },
  });

  if (!store) {
    throw new AppError(
      404,
      "La información de la tienda no está configurada.",
    );
  }

  response.json(store);
}

export async function updateAdminStore(
  request: Request,
  response: Response,
): Promise<void> {
  const validation = updateStoreSchema.safeParse(request.body);

  if (!validation.success) {
    throw new AppError(
      400,
      "Revisa la información enviada.",
      validation.error.flatten().fieldErrors,
    );
  }

  const data = validation.data;

  const store = await prisma.tienda.update({
    where: {
      id: 1,
    },

    data: {
      nombre: data.nombre,

      eslogan:
        data.eslogan === undefined
          ? undefined
          : normalizeNullableText(data.eslogan),

      introduccion:
        data.introduccion === undefined
          ? undefined
          : normalizeNullableText(data.introduccion),

      descripcion:
        data.descripcion === undefined
          ? undefined
          : normalizeNullableText(data.descripcion),

      whatsapp: data.whatsapp,

      telefono:
        data.telefono === undefined
          ? undefined
          : normalizeNullableText(data.telefono),

      direccion:
        data.direccion === undefined
          ? undefined
          : normalizeNullableText(data.direccion),

      horarios:
        data.horarios === undefined
          ? undefined
          : normalizeNullableText(data.horarios),

      facebook:
        data.facebook === undefined
          ? undefined
          : normalizeNullableText(data.facebook),

      instagram:
        data.instagram === undefined
          ? undefined
          : normalizeNullableText(data.instagram),

      moneda: data.moneda,

      mensajeWhatsapp:
        data.mensajeWhatsapp === undefined
          ? undefined
          : normalizeNullableText(data.mensajeWhatsapp),
    },
  });

  response.json({
    message: "Información actualizada correctamente.",
    tienda: store,
  });
}