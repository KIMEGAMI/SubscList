import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function databaseConfig() {
  const url = new URL(env.databaseUrl);
  const [user, password = ""] = url.username
    ? [decodeURIComponent(url.username), decodeURIComponent(url.password)]
    : ["", ""];

  return {
    host: url.hostname,
    port: Number(url.port || "3306"),
    user,
    password,
    database: url.pathname.replace(/^\//, ""),
    charset: "utf8mb4",
  };
}

const adapter = new PrismaMariaDb(databaseConfig());

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
