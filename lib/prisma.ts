import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClientSingleton = () => {
  const rawConnectionString = process.env.DATABASE_URL;
  
  if (!rawConnectionString) {
    console.warn("DATABASE_URL is not defined. Prisma is running in disconnected mode.");
    // Devolver un Proxy para evitar fallas en el acceso a la propiedad durante el desarrollo
    return new Proxy({}, {
      get: (_, prop) => {
        return new Proxy(() => {}, {
          get: () => () => {
            console.error(`Prisma tried to access "${String(prop)}" in disconnected mode.`);
            return null;
          },
          apply: () => {
            console.error(`Prisma tried to call "${String(prop)}" in disconnected mode.`);
            return null;
          }
        });
      }
    }) as unknown as PrismaClient;
  }

  const isProduction = process.env.NODE_ENV === "production";

  // Configurar pool de conexiones adaptado a serverless y prevenir agotamiento de sockets
  const pool = new pg.Pool({
    connectionString: rawConnectionString,
    max: isProduction ? 10 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export { prisma };
export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
