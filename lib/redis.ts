import Redis from "ioredis";

let hasLoggedRefusal = false;

const redisSingleton = () => {
  const url = process.env.REDIS_URL;

  if (!url) {
    return null;
  }

  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    keyPrefix: process.env.REDIS_KEY_PREFIX || "lambdaidx:",
    retryStrategy(times) {
      if (times > 3) {
        if (!hasLoggedRefusal && process.env.NODE_ENV !== "production") {
          console.warn("⚠️ Redis no está activo localmente. Operando en modo directo a PostgreSQL.");
          hasLoggedRefusal = true;
        }
        return null; // Detener reintentos automáticos para evitar spam en consola
      }
      return Math.min(times * 200, 1000);
    },
  });

  client.on("error", (error: { code?: string; message?: string }) => {
    if (error?.code === "ECONNREFUSED") {
      if (!hasLoggedRefusal && process.env.NODE_ENV !== "production") {
        console.warn("⚠️ Redis client connection refused. Modo PostgreSQL activo.");
        hasLoggedRefusal = true;
      }
      return;
    }
    console.error("Redis client error:", error);
  });

  return client;
};

type RedisClientSingleton = ReturnType<typeof redisSingleton>;

const globalForRedis = globalThis as unknown as {
  redis: RedisClientSingleton | undefined;
};

export const redis = globalForRedis.redis ?? redisSingleton();

export function isRedisConfigured() {
  return Boolean(process.env.REDIS_URL);
}

export async function getRedisClient() {
  if (!redis) {
    return null;
  }

  if (redis.status === "end" || redis.status === "close") {
    return null;
  }

  if (redis.status === "wait") {
    try {
      await redis.connect();
    } catch {
      return null;
    }
  }

  return redis.status === "ready" ? redis : null;
}

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
