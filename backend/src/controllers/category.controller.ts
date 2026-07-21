import type { Request, Response } from "express";

import { prisma } from "../config/prisma.js";

export async function getAdminCategories(
  _request: Request,
  response: Response,
): Promise<void> {
  const categories = await prisma.categoria.findMany({
    orderBy: [
      {
        orden: "asc",
      },
      {
        nombre: "asc",
      },
    ],

    include: {
      _count: {
        select: {
          productos: true,
        },
      },
    },
  });

  response.json(categories);
}