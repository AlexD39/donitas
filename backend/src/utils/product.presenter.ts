interface ProductWithPrice {
  precio: {
    toString(): string;
  };
}

export function presentProduct<T extends ProductWithPrice>(
  product: T,
) {
  return {
    ...product,
    precio: Number(product.precio.toString()),
  };
}