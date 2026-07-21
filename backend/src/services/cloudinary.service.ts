import type {
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";

import { cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export type CloudinaryFolder =
  | "productos"
  | "tienda";

export interface CloudinaryImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export function uploadImageToCloudinary(
  buffer: Buffer,
  folder: CloudinaryFolder,
): Promise<CloudinaryImage> {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
          resource_type: "image",
          unique_filename: true,
          overwrite: false,
          format: "webp",

          transformation: [
            {
              width: 1600,
              height: 1600,
              crop: "limit",
            },
          ],
        },
        (
          error:
            | UploadApiErrorResponse
            | undefined,
          result:
            | UploadApiResponse
            | undefined,
        ) => {
          if (error || !result) {
            console.error(
              "Error de Cloudinary:",
              error,
            );

            reject(
              new AppError(
                502,
                "No se pudo subir la imagen a Cloudinary.",
              ),
            );

            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

    uploadStream.end(buffer);
  });
}

export async function deleteImageFromCloudinary(
  publicId: string,
): Promise<void> {
  const result =
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
        invalidate: true,
      },
    );

  if (
    result.result !== "ok" &&
    result.result !== "not found"
  ) {
    throw new AppError(
      502,
      "Cloudinary no pudo eliminar la imagen.",
    );
  }
}

export async function safelyDeleteCloudinaryImage(
  publicId: string | null,
): Promise<void> {
  if (!publicId) {
    return;
  }

  try {
    await deleteImageFromCloudinary(publicId);
  } catch (error) {
    console.error(
      `No se pudo limpiar la imagen ${publicId}:`,
      error,
    );
  }
}