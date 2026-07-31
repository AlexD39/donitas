import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

async function main(): Promise<void> {
  await prisma.$connect();

const server = app.listen(
  env.PORT,
  "0.0.0.0",
  () => {
    console.log(
      `🍩 API de Donitas Anita: http://localhost:${env.PORT}`,
    );
  },
);

  async function shutdown(signal: string): Promise<void> {
    console.log(`\nCerrando servidor por ${signal}...`);

    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });

    setTimeout(() => {
      process.exit(1);
    }, 10_000).unref();
  }

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

main().catch(async (error: unknown) => {
  console.error("No se pudo iniciar el servidor:", error);
  await prisma.$disconnect();
  process.exit(1);
});