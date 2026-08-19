import { getRedisClient } from "@/lib/redis";

const DEFAULT_TTL = 3600; // 1 hour in seconds
const RELATIONS_TTL = 1800; // 30 minutes in seconds

export class CacheService {
  /**
   * Key formatting helpers
   */
  static keys = {
    page: (slugPath: string) => `page:slug:${slugPath.toLowerCase()}`,
    relations: (pageId: string) => `relations:page:${pageId}`,
    breadcrumbs: (path: string) => `breadcrumbs:path:${path}`,
    hierarchy: () => `hierarchy:tree`,
  };

  /**
   * Retrieves an item from Redis cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const redis = await getRedisClient();
      if (!redis) return null;

      const cachedData = await redis.get(key);
      if (!cachedData) return null;

      return JSON.parse(cachedData) as T;
    } catch (error) {
      console.warn(`Cache GET error for key [${key}]:`, error);
      return null;
    }
  }

  /**
   * Stores an item in Redis cache with an optional TTL in seconds
   */
  static async set(key: string, value: unknown, ttlSeconds = DEFAULT_TTL): Promise<boolean> {
    try {
      const redis = await getRedisClient();
      if (!redis) return false;

      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await redis.set(key, serialized, "EX", ttlSeconds);
      } else {
        await redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.warn(`Cache SET error for key [${key}]:`, error);
      return false;
    }
  }

  /**
   * Removes a single key from Redis cache
   */
  static async del(key: string): Promise<boolean> {
    try {
      const redis = await getRedisClient();
      if (!redis) return false;

      await redis.del(key);
      return true;
    } catch (error) {
      console.warn(`Cache DEL error for key [${key}]:`, error);
      return false;
    }
  }

  /**
   * Removes multiple keys matching a pattern using non-blocking SCAN stream (e.g. "page:*")
   */
  static async delPattern(pattern: string): Promise<boolean> {
    try {
      const redis = await getRedisClient();
      if (!redis) return false;

      const prefix = process.env.REDIS_KEY_PREFIX || "lambdaidx:";
      const matchPattern = pattern.startsWith(prefix) ? pattern : `${prefix}${pattern}`;
      const stream = redis.scanStream({
        match: matchPattern,
        count: 100,
      });

      return new Promise<boolean>((resolve) => {
        const keysToDelete: string[] = [];

        stream.on("data", (resultKeys: string[]) => {
          for (const key of resultKeys) {
            const rawKey = key.startsWith(prefix) ? key.slice(prefix.length) : key;
            keysToDelete.push(rawKey);
          }
        });

        stream.on("end", async () => {
          try {
            if (keysToDelete.length > 0) {
              const chunkSize = 500;
              for (let i = 0; i < keysToDelete.length; i += chunkSize) {
                const chunk = keysToDelete.slice(i, i + chunkSize);
                await redis.del(...chunk);
              }
            }
            resolve(true);
          } catch (delError) {
            console.warn(`Cache DEL error during scanStream end for [${pattern}]:`, delError);
            resolve(false);
          }
        });

        stream.on("error", (streamError) => {
          console.warn(`Cache SCAN stream error for [${pattern}]:`, streamError);
          resolve(false);
        });
      });
    } catch (error) {
      console.warn(`Cache DEL pattern error for [${pattern}]:`, error);
      return false;
    }
  }

  /**
   * Specific helper to invalidate all caches for a given page and its relations
   */
  static async invalidatePageCaches(pageId: string, slug?: string, path?: string): Promise<void> {
    try {
      await Promise.all([
        this.del(this.keys.relations(pageId)),
        slug ? this.del(this.keys.page(slug)) : Promise.resolve(),
        path ? this.del(this.keys.breadcrumbs(path)) : Promise.resolve(),
        this.del(this.keys.hierarchy()),
        this.del("hierarchy:tree:full"),
        this.delPattern("hierarchy:*"),
        this.delPattern("page:slug:*"),
      ]);
    } catch (error) {
      console.warn(`Error invalidating page caches for page [${pageId}]:`, error);
    }
  }
}
export { RELATIONS_TTL };
