import type { Request, Response } from "express";

import { prisma } from "../config/prisma.js";

import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";

import {
  assertCategoryExists,
  createUniqueProductSlug,
} from "../services/product.service.js";

import { AppError } from "../utils/app-error.js";
import { presentProduct } from "../utils/product.presenter.js";

import {
  safelyDeleteCloudinaryImage,
} from "../services/cloudinary.service.js";

function emptyStringToNull(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  const normalized = value.trim();

  return normalized === "" ? null : normalized;
}

function parseProductId(
  value: string | string[] | undefined,
): number {
  if (typeof value !== "string") {
    throw new AppError(
      400,
      "El identificador del producto no es válido.",
    );
  }

  const validation = productIdSchema.safeParse(value);

  if (!validation.success) {
    throw new AppError(
      400,
      "El identificador del producto no es válido.",
    );
  }

  return validation.data;
}

export async function getAdminProducts(
  _request: Request,
  response: Response,
): Promise<void> {
  const products = await prisma.producto.findMany({
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

export async function getAdminProductById(
  request: Request,
  response: Response,
): Promise<void> {
  const productId = parseProductId(request.params.id);

  const product = await prisma.producto.findUnique({
    where: {
      id: productId,
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
    throw new AppError(404, "Producto no encontrado.");
  }

  response.json(presentProduct(product));
}

export async function createProduct(
  request: Request,
  response: Response,
): Promise<void> {
  const validation = createProductSchema.safeParse(
    request.body,
  );

  if (!validation.success) {
    throw new AppError(
      400,
      "Revisa los datos del producto.",
      validation.error.flatten().fieldErrors,
    );
  }

  const data = validation.data;

  await assertCategoryExists(data.categoriaId);

  const slug = await createUniqueProductSlug(
    data.slug ?? data.nombre,
  );

  const product = await prisma.producto.create({
    data: {
      nombre: data.nombre,
      slug,

      descripcionCorta: emptyStringToNull(
        data.descripcionCorta,
      ),

      descripcion: emptyStringToNull(data.descripcion),

      ingredientes: emptyStringToNull(data.ingredientes),

      presentacion: emptyStringToNull(data.presentacion),

      precio: data.precio,

      imagen: emptyStringToNull(data.imagen),

      disponible: data.disponible ?? true,
      destacado: data.destacado ?? false,
      categoriaId: data.categoriaId ?? null,
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

  response.status(201).json({
    message: "Producto registrado correctamente.",
    producto: presentProduct(product),
  });
}

export async function updateProduct(
  request: Request,
  response: Response,
): Promise<void> {
  const productId = parseProductId(request.params.id);

  const validation = updateProductSchema.safeParse(
    request.body,
  );

  if (!validation.success) {
    throw new AppError(
      400,
      "Revisa los datos del producto.",
      validation.error.flatten().fieldErrors,
    );
  }

  const existingProduct =
    await prisma.producto.findUnique({
      where: {
        id: productId,
      },

      select: {
        id: true,
      },
    });

  if (!existingProduct) {
    throw new AppError(404, "Producto no encontrado.");
  }

  const data = validation.data;

  await assertCategoryExists(data.categoriaId);

  const slug =
    data.slug !== undefined
      ? await createUniqueProductSlug(
          data.slug,
          productId,
        )
      : undefined;

  const product = await prisma.producto.update({
    where: {
      id: productId,
    },

    data: {
      nombre: data.nombre,
      slug,

      descripcionCorta:
        data.descripcionCorta === undefined
          ? undefined
          : emptyStringToNull(data.descripcionCorta),

      descripcion:
        data.descripcion === undefined
          ? undefined
          : emptyStringToNull(data.descripcion),

      ingredientes:
        data.ingredientes === undefined
          ? undefined
          : emptyStringToNull(data.ingredientes),

      presentacion:
        data.presentacion === undefined
          ? undefined
          : emptyStringToNull(data.presentacion),

      precio: data.precio,

      imagen:
        data.imagen === undefined
          ? undefined
          : emptyStringToNull(data.imagen),

      disponible: data.disponible,
      destacado: data.destacado,
      categoriaId: data.categoriaId,
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

  response.json({
    message: "Producto actualizado correctamente.",
    producto: presentProduct(product),
  });
}

export async function deleteProduct(
  request: Request,
  response: Response,
): Promise<void> {
  const productId = parseProductId(request.params.id);

  const product = await prisma.producto.findUnique({
    where: {
      id: productId,
    },

    select: {
      id: true,
      imagenPublicId: true,
    },
  });

  if (!product) {
    throw new AppError(
      404,
      "Producto no encontrado.",
    );
  }

  await prisma.producto.delete({
    where: {
      id: productId,
    },
  });

  await safelyDeleteCloudinaryImage(
    product.imagenPublicId,
  );

  response.json({
    message: "Producto eliminado correctamente.",
  });
}