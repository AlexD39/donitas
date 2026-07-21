import { Router } from "express";

import {
  getAdminCategories,
} from "../controllers/category.controller.js";

import {
  getDashboard,
} from "../controllers/dashboard.controller.js";

import {
  createProduct,
  deleteProduct,
  getAdminProductById,
  getAdminProducts,
  updateProduct,
} from "../controllers/product.controller.js";

import {
  requireAdmin,
  requireAuth,
} from "../middlewares/auth.middleware.js";

import { asyncHandler } from "../utils/async-handler.js";

import {
  deleteProductImage,
  deleteStoreImage,
  uploadProductImage,
  uploadStoreImage,
} from "../controllers/image.controller.js";

import {
  imageUpload,
} from "../middlewares/image-upload.middleware.js";

import {
  getAdminStore,
  updateAdminStore,
} from "../controllers/store.controller.js";

const router = Router();

/*
 * Todo lo definido debajo requiere:
 * 1. Sesión válida.
 * 2. Rol ADMIN.
 */
router.use(asyncHandler(requireAuth));
router.use(requireAdmin);

router.get(
  "/dashboard",
  asyncHandler(getDashboard),
);

router.get(
  "/categorias",
  asyncHandler(getAdminCategories),
);

router.get(
  "/productos",
  asyncHandler(getAdminProducts),
);

router.get(
  "/productos/:id",
  asyncHandler(getAdminProductById),
);

router.post(
  "/productos",
  asyncHandler(createProduct),
);

router.put(
  "/productos/:id",
  asyncHandler(updateProduct),
);

router.patch(
  "/productos/:id",
  asyncHandler(updateProduct),
);

router.delete(
  "/productos/:id",
  asyncHandler(deleteProduct),
);

router.post(
  "/productos/:id/imagen",
  imageUpload.single("imagen"),
  asyncHandler(uploadProductImage),
);

router.delete(
  "/productos/:id/imagen",
  asyncHandler(deleteProductImage),
);

router.post(
  "/tienda/imagenes/:tipo",
  imageUpload.single("imagen"),
  asyncHandler(uploadStoreImage),
);

router.delete(
  "/tienda/imagenes/:tipo",
  asyncHandler(deleteStoreImage),
);

router.get(
  "/tienda",
  asyncHandler(getAdminStore),
);

router.put(
  "/tienda",
  asyncHandler(updateAdminStore),
);

router.patch(
  "/tienda",
  asyncHandler(updateAdminStore),
);

export default router;