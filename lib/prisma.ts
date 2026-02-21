import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: ["error", "warn"],
    datasourceUrl: appendConnectTimeout(process.env.DATABASE_URL),
  });
}

/**
 * Appends connect_timeout and pool_timeout to the DATABASE_URL
 * if not already present — helps with Neon serverless cold starts.
 */
function appendConnectTimeout(url: string | undefined): string | undefined {
  if (!url) return url;
  const params: string[] = [];
  if (!url.includes("connect_timeout")) params.push("connect_timeout=30");
  if (!url.includes("pool_timeout")) params.push("pool_timeout=30");
  if (params.length === 0) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params.join("&")}`;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
