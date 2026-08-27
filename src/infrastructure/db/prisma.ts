import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Cria um {@link PrismaClient} apontando para o Postgres (Supabase no futuro).
 * Sem {@code DATABASE_URL} configurado, o client é criado, porém qualquer query
 * falhará — o que é esperado nesta fase de desenvolvimento.
 */
function getConnectionString(): string {
  const urls = [
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL,
  ].filter((value): value is string => Boolean(value));

  const remoteUrl = urls.find((value) => {
    try {
      const hostname = new URL(value).hostname;
      return hostname !== "127.0.0.1" && hostname !== "localhost";
    } catch {
      return false;
    }
  });

  if (remoteUrl) return remoteUrl;

  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE;

  if (host && user && password && database) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${database}?sslmode=require`;
  }

  return urls[0] ?? "";
}

export function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: getConnectionString(),
  });
  return new PrismaClient({ adapter });
}

/** Singleton do client (evita múltiplas conexões em dev/hot-reload). */
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
