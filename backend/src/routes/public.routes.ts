import { Router } from "express";

import {
  getPublicCategories,
  getPublicProductBySlug,
  getPublicProducts,
  getPublicStore,
} from "../controllers/public.controller.js";

import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get(
  "/tienda",
  asyncHandler(getPublicStore),
);

router.get(
  "/categorias",
  asyncHandler(getPublicCategories),
);

router.get(
  "/productos",
  asyncHandler(getPublicProducts),
);

router.get(
  "/productos/:slug",
  asyncHandler(getPublicProductBySlug),
);

export default router;