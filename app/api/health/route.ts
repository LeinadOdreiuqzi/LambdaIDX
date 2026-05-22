import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { meilisearch, isMeilisearchConfigured } from "@/lib/meilisearch";
import { getRedisClient, isRedisConfigured } from "@/lib/redis";

type ServiceHealth = {
  status: "ok" | "disabled" | "error";
  details?: string;
};

export async function GET() {
  const timestamp = new Date().toISOString();

  const database = await checkDatabaseHealth();
  const meilisearchHealth = await checkMeilisearchHealth();
  const redis = await checkRedisHealth();

  const hasError = [database, meilisearchHealth, redis].some(
    (service) => service.status === "error"
  );

  return NextResponse.json(
    {
      status: hasError ? "degraded" : "ok",
      timestamp,
      services: {
        app: { status: "ok" },
        database,
        meilisearch: meilisearchHealth,
        redis,
      },
    },
    { status: hasError ? 503 : 200 }
  );
}

async function checkDatabaseHealth(): Promise<ServiceHealth> {
  if (!process.env.DATABASE_URL) {
    return {
      status: "disabled",
      details: "DATABASE_URL is not configured.",
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  } catch (error) {
    return {
      status: "error",
      details: error instanceof Error ? error.message : "Database connection failed.",
    };
  }
}

async function checkMeilisearchHealth(): Promise<ServiceHealth> {
  if (!isMeilisearchConfigured() || !meilisearch) {
    return {
      status: "disabled",
      details: "MEILISEARCH_HOST is not configured.",
    };
  }

  try {
    const health = await meilisearch.health();
    return {
      status: health.status === "available" ? "ok" : "error",
      details: health.status,
    };
  } catch (error) {
    return {
      status: "error",
      details: error instanceof Error ? error.message : "Meilisearch connection failed.",
    };
  }
}

async function checkRedisHealth(): Promise<ServiceHealth> {
  if (!isRedisConfigured()) {
    return {
      status: "disabled",
      details: "REDIS_URL is not configured.",
    };
  }

  try {
    const redis = await getRedisClient();

    if (!redis) {
      return {
        status: "disabled",
        details: "Redis client is unavailable.",
      };
    }

    const pong = await redis.ping();
    return {
      status: pong === "PONG" ? "ok" : "error",
      details: pong,
    };
  } catch (error) {
    return {
      status: "error",
      details: error instanceof Error ? error.message : "Redis connection failed.",
    };
  }
}
