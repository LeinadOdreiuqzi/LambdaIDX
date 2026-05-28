import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { meilisearch } from '@/lib/meilisearch';

export async function GET() {
  // Test Redis (ping)
  let redisOk = false;
  try {
    await redis?.ping();
    redisOk = true;
  } catch (e) {
    console.error('Redis ping error:', e);
    redisOk = false;
  }

  // Test MeiliSearch (health endpoint)
  let meiliOk = false;
  try {
    await meilisearch?.health();
    meiliOk = true;
  } catch (e) {
    console.error('MeiliSearch health error:', e);
    meiliOk = false;
  }

  const status = {
    redis: redisOk ? 'online' : 'offline',
    meilisearch: meiliOk ? 'online' : 'offline',
  };

  return NextResponse.json(status);
}
