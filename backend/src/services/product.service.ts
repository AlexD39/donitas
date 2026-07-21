import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { createSlug } from "../utils/slug.js";

export async function createUniqueProductSlug(
  value: string,
  excludedProductId?: number,
): Promise<string> {
  const baseSlug = createSlug(value);

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existingProduct =
      await prisma.producto.findFirst({
        where: {
          slug: candidate,

          ...(excludedProductId
            ? {
                NOT: {
                  id: excludedProductId,
                },
              }
            : {}),
        },

        select: {
          id: true,
        },
      });

    if (!existingProduct) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function assertCategoryExists(
  categoryId: number | null | undefined,
): Promise<void> {
  if (categoryId === null || categoryId === undefined) {
    return;
  }

  const category = await prisma.categoria.findUnique({
    where: {
      id: categoryId,
    },

    select: {
      id: true,
    },
  });

  if (!category) {
    throw new AppError(
      400,
      "La categoría seleccionada no existe.",
    );
  }
}