import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient__: PrismaClient | undefined;
}

const prismaClient = global.__prismaClient__ ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prismaClient__ = prismaClient;
}

export const prisma = prismaClient;
