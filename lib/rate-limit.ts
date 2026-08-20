import { getRedisClient } from "@/lib/redis";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

// Respaldo en memoria local para entornos sin Redis
const memoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Limita la tasa de peticiones por identificador (ej: IP o usuario)
 * @param identifier Identificador unico (IP)
 * @param limit Numero maximo de peticiones permitidas en la ventana
 * @param windowSeconds Tamano de la ventana en segundos
 */
export async function checkRateLimit(
  identifier: string,
  limit = 10,
  windowSeconds = 60
): Promise<RateLimitResult> {
  const now = Date.now();
  const redis = await getRedisClient();

  if (redis) {
    try {
      const key = `ratelimit:${identifier}`;
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      const ttl = await redis.ttl(key);
      const resetSeconds = ttl > 0 ? ttl : windowSeconds;

      return {
        success: count <= limit,
        limit,
        remaining: Math.max(0, limit - count),
        resetSeconds,
      };
    } catch {
      // Si Redis falla, continuar con almacenamiento en memoria
    }
  }

  // Almacenamiento en memoria local
  const entry = memoryStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    memoryStore.set(identifier, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
    };
  }

  entry.count += 1;
  const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

  // Limpieza periodica si la memoria crece
  if (memoryStore.size > 5000) {
    for (const [k, v] of memoryStore.entries()) {
      if (now > v.resetTime) memoryStore.delete(k);
    }
  }

  return {
    success: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count),
    resetSeconds: Math.max(0, resetSeconds),
  };
}

/**
 * Extrae la direccion IP cliente desde los headers de Next.js
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
