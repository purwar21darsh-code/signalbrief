import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

function createDatabaseAdapter() {
  const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  if (databaseUrl.startsWith("file:")) return new PrismaBetterSqlite3({ url: databaseUrl });
  if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
    const url = new URL(databaseUrl);
    // `schema` is Prisma-specific; the pg driver uses PostgreSQL's default schema search path.
    url.searchParams.delete("schema");
    return new PrismaPg({ connectionString: url.toString() });
  }
  throw new Error("DATABASE_URL must use a SQLite file: URL locally or a PostgreSQL URL in production.");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: createDatabaseAdapter(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
