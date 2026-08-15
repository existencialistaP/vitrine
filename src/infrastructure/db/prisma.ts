import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Cria um {@link PrismaClient} apontando para o Postgres (Supabase no futuro).
 * Sem {@code DATABASE_URL} configurado, o client é criado, porém qualquer query
 * falhará — o que é esperado nesta fase de desenvolvimento.
 */
export function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? "",
  });
  return new PrismaClient({ adapter });
}

/** Singleton do client (evita múltiplas conexões em dev/hot-reload). */
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
