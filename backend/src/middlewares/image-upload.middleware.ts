import multer from "multer";

import { AppError } from "../utils/app-error.js";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const imageUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(
          400,
          "La imagen debe ser JPG, PNG o WebP.",
        ),
      );

      return;
    }

    callback(null, true);
  },
});