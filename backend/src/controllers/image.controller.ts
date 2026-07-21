import type {
  Request,
  Response,
} from "express";

import { prisma } from "../config/prisma.js";

import {
  safelyDeleteCloudinaryImage,
  uploadImageToCloudinary,
} from "../services/cloudinary.service.js";

import { AppError } from "../utils/app-error.js";

function parseId(
  value: string | string[] | undefined,
): number {
  if (typeof value !== "string") {
    throw new AppError(
      400,
      "El identificador no es válido.",
    );
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(
      400,
      "El identificador no es válido.",
    );
  }

  return id;
}

function requireUploadedFile(
  file: Express.Multer.File | undefined,
): Express.Multer.File {
  if (!file) {
    throw new AppError(
      400,
      "Debes seleccionar una imagen.",
    );
  }

  return file;
}

function parseStoreImageType(
  value: string | string[] | undefined,
): "logo" | "portada" {
  if (value !== "logo" && value !== "portada") {
    throw new AppError(
      400,
      "El tipo de imagen de tienda no es válido.",
    );
  }

  return value;
}

/* Imagen de producto */

export async function uploadProductImage(
  request: Request,
  response: Response,
): Promise<void> {
  const productId = parseId(request.params.id);
  const file = requireUploadedFile(request.file);

  const product =
    await prisma.producto.findUnique({
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

  const uploaded =
    await uploadImageToCloudinary(
      file.buffer,
      "productos",
    );

  try {
    const updatedProduct =
      await prisma.producto.update({
        where: {
          id: productId,
        },
        data: {
          imagen: uploaded.url,
          imagenPublicId: uploaded.publicId,
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

    await safelyDeleteCloudinaryImage(
      product.imagenPublicId,
    );

    response.status(201).json({
      message:
        "Imagen del producto actualizada correctamente.",
      producto: {
        ...updatedProduct,
        precio: Number(
          updatedProduct.precio.toString(),
        ),
      },
    });
  } catch (error) {
    await safelyDeleteCloudinaryImage(
      uploaded.publicId,
    );

    throw error;
  }
}

export async function deleteProductImage(
  request: Request,
  response: Response,
): Promise<void> {
  const productId = parseId(request.params.id);

  const product =
    await prisma.producto.findUnique({
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

  await prisma.producto.update({
    where: {
      id: productId,
    },
    data: {
      imagen: null,
      imagenPublicId: null,
    },
  });

  await safelyDeleteCloudinaryImage(
    product.imagenPublicId,
  );

  response.json({
    message:
      "Imagen del producto eliminada correctamente.",
  });
}

/* Logo y portada */

export async function uploadStoreImage(
  request: Request,
  response: Response,
): Promise<void> {
  const imageType = parseStoreImageType(
    request.params.tipo,
  );

  const file = requireUploadedFile(request.file);

  const store = await prisma.tienda.findUnique({
    where: {
      id: 1,
    },
    select: {
      id: true,
      logoPublicId: true,
      portadaPublicId: true,
    },
  });

  if (!store) {
    throw new AppError(
      404,
      "La tienda no está configurada.",
    );
  }

  const uploaded =
    await uploadImageToCloudinary(
      file.buffer,
      "tienda",
    );

  const previousPublicId =
    imageType === "logo"
      ? store.logoPublicId
      : store.portadaPublicId;

  const updateData =
    imageType === "logo"
      ? {
          logo: uploaded.url,
          logoPublicId: uploaded.publicId,
        }
      : {
          portada: uploaded.url,
          portadaPublicId:
            uploaded.publicId,
        };

  try {
    const updatedStore =
      await prisma.tienda.update({
        where: {
          id: 1,
        },
        data: updateData,
      });

    await safelyDeleteCloudinaryImage(
      previousPublicId,
    );

    response.status(201).json({
      message:
        `${imageType} actualizado correctamente.`,
      tienda: updatedStore,
    });
  } catch (error) {
    await safelyDeleteCloudinaryImage(
      uploaded.publicId,
    );

    throw error;
  }
}

export async function deleteStoreImage(
  request: Request,
  response: Response,
): Promise<void> {
  const imageType = parseStoreImageType(
    request.params.tipo,
  );

  const store = await prisma.tienda.findUnique({
    where: {
      id: 1,
    },
    select: {
      logoPublicId: true,
      portadaPublicId: true,
    },
  });

  if (!store) {
    throw new AppError(
      404,
      "La tienda no está configurada.",
    );
  }

  const publicId =
    imageType === "logo"
      ? store.logoPublicId
      : store.portadaPublicId;

  const updateData =
    imageType === "logo"
      ? {
          logo: null,
          logoPublicId: null,
        }
      : {
          portada: null,
          portadaPublicId: null,
        };

  await prisma.tienda.update({
    where: {
      id: 1,
    },
    data: updateData,
  });

  await safelyDeleteCloudinaryImage(publicId);

  response.json({
    message:
      `${imageType} eliminado correctamente.`,
  });
}