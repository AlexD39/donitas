import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL no está configurada.");
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const adminName = process.env.ADMIN_NAME ?? "Administrador";
  const adminEmail =
    process.env.ADMIN_EMAIL?.trim().toLowerCase() ??
    "admin@donitasanita.com";
  const adminPassword =
    process.env.ADMIN_PASSWORD ?? "CambiaEstaPassword123!";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.usuario.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      nombre: adminName,
      passwordHash,
      activo: true,
      rol: "ADMIN",
    },
    create: {
      nombre: adminName,
      email: adminEmail,
      passwordHash,
      rol: "ADMIN",
      activo: true,
    },
  });

  await prisma.tienda.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {
      id: 1,
      nombre: "Donitas Anita",
      eslogan: "Hechas con amor",
      introduccion:
        "Donitas artesanales preparadas para endulzar tus mejores momentos.",
      descripcion:
        "En Donitas Anita elaboramos productos frescos, deliciosos y preparados con mucho cariño.",
      whatsapp: "522361170217",
      direccion: "Zinacatepec, Puebla",
      horarios: "Lunes a sábado de 9:00 a 19:00",
      moneda: "MXN",
      mensajeWhatsapp:
        "Hola, me interesa realizar un pedido de Donitas Anita.",
    },
  });

  const categorias = [
    {
      nombre: "Donas clásicas",
      slug: "donas-clasicas",
      descripcion: "Sabores tradicionales para cualquier ocasión.",
      orden: 1,
    },
    {
      nombre: "Donas especiales",
      slug: "donas-especiales",
      descripcion: "Combinaciones especiales y decoradas.",
      orden: 2,
    },
    {
      nombre: "Paquetes",
      slug: "paquetes",
      descripcion: "Presentaciones con varias donas.",
      orden: 3,
    },
  ];

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: {
        slug: categoria.slug,
      },
      update: categoria,
      create: categoria,
    });
  }

  const categoriaClasica = await prisma.categoria.findUniqueOrThrow({
    where: {
      slug: "donas-clasicas",
    },
  });

  await prisma.producto.upsert({
    where: {
      slug: "dona-de-fresa",
    },
    update: {},
    create: {
      nombre: "Dona de fresa",
      slug: "dona-de-fresa",
      descripcionCorta: "Dona artesanal con cobertura de fresa.",
      descripcion:
        "Dona suave cubierta con glaseado de fresa y chispas de colores.",
      ingredientes: "Harina, leche, azúcar, fresa y chispas.",
      presentacion: "Pieza individual",
      precio: 25,
      disponible: true,
      destacado: true,
      categoriaId: categoriaClasica.id,
    },
  });

  console.log("Base inicial creada correctamente.");
  console.log(`Administrador: ${adminEmail}`);
}

main()
  .catch((error: unknown) => {
    console.error("Error ejecutando el seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
  await prisma.$disconnect();
});