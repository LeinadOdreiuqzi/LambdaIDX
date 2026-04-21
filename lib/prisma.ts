import { PrismaClient } from '../prisma/generated';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL is not defined. Prisma is running in disconnected mode.");
    // Return a Proxy to prevent crashes on property access during development
    return new Proxy({}, {
      get: (_, prop) => {
        return new Proxy(() => {}, {
          get: () => () => {
            console.error(`❌ Prisma tried to access "${String(prop)}" in disconnected mode.`);
            return null;
          },
          apply: () => {
            console.error(`❌ Prisma tried to call "${String(prop)}" in disconnected mode.`);
            return null;
          }
        });
      }
    }) as unknown as PrismaClient;
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
