// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { pool } from "./db";

let prisma: any;

try {
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} catch {
  console.warn('[AI Studio] Database not connected — using mock');
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
    count: async () => 0,
    upsert: async (d: any) => d?.create ?? {},
  };
  prisma = new Proxy({}, {
    get: () => new Proxy(noOp, {
      get: (target, prop) => (target as any)[prop] || (async () => null)
    })
  });
}

export { prisma };
export default prisma;
