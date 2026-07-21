import type { Request, Response } from "express";

import { prisma } from "../config/prisma.js";
import { presentProduct } from "../utils/product.presenter.js";

export async function getDashboard(
  _request: Request,
  response: Response,
): Promise<void> {
  const [
    totalProductos,
    productosDisponibles,
    productosAgotados,
    productosDestacados,
    totalCategorias,
    productosRecientes,
  ] = await prisma.$transaction([
    prisma.producto.count(),

    prisma.producto.count({
      where: {
        disponible: true,
      },
    }),

    prisma.producto.count({
      where: {
        disponible: false,
      },
    }),

    prisma.producto.count({
      where: {
        destacado: true,
      },
    }),

    prisma.categoria.count(),

    prisma.producto.findMany({
      take: 5,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    }),
  ]);

  response.json({
    resumen: {
      totalProductos,
      productosDisponibles,
      productosAgotados,
      productosDestacados,
      totalCategorias,
    },

    productosRecientes: productosRecientes.map(
      presentProduct,
    ),
  });
}