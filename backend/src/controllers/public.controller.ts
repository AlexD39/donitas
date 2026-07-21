import type { Request, Response } from "express";

import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { presentProduct } from "../utils/product.presenter.js";


export async function getPublicStore(
  _request: Request,
  response: Response,
): Promise<void> {
  const store = await prisma.tienda.findUnique({
    where: {
      id: 1,
    },

    select: {
      id: true,
      nombre: true,
      eslogan: true,
      introduccion: true,
      descripcion: true,
      logo: true,
      portada: true,
      whatsapp: true,
      telefono: true,
      direccion: true,
      horarios: true,
      facebook: true,
      instagram: true,
      moneda: true,
      mensajeWhatsapp: true,
    },
  });

  if (!store) {
    throw new AppError(
      404,
      "La tienda todavía no está configurada.",
    );
  }

  response.json(store);
}

export async function getPublicCategories(
  _request: Request,
  response: Response,
): Promise<void> {
  const categories = await prisma.categoria.findMany({
    where: {
      activa: true,
    },

    orderBy: [
      {
        orden: "asc",
      },
      {
        nombre: "asc",
      },
    ],

    select: {
      id: true,
      nombre: true,
      slug: true,
      descripcion: true,
    },
  });

  response.json(categories);
}

export async function getPublicProducts(
  _request: Request,
  response: Response,
): Promise<void> {
  const products = await prisma.producto.findMany({
    where: {
      disponible: true,
    },

    orderBy: [
      {
        destacado: "desc",
      },
      {
        createdAt: "desc",
      },
    ],

    include: {
      categoria: {
        select: {
          id: true,
          nombre: true,
          slug: true,
        },
      },
    },
  });

  response.json(products.map(presentProduct));
}

export async function getPublicProductBySlug(
  request: Request,
  response: Response,
): Promise<void> {
  const slugValue = request.params.slug;

  if (typeof slugValue !== "string" || !slugValue.trim()) {
    throw new AppError(
      400,
      "El producto solicitado no es válido.",
    );
  }

  const product = await prisma.producto.findFirst({
    where: {
      slug: slugValue,
      disponible: true,
    },

    include: {
      categoria: {
        select: {
          id: true,
          nombre: true,
          slug: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError(
      404,
      "Producto no encontrado.",
    );
  }

  response.json(presentProduct(product));
}