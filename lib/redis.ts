import Redis from "ioredis";

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
  });

  client.on("error", (error) => {
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

  if (redis.status === "wait") {
    await redis.connect();
  }

  return redis;
}

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
