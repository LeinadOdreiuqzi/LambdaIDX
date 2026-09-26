import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/services/search-service";
import { AuthError, requireAdminSession } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function hasValidInternalKey(request: NextRequest): boolean {
  const configuredKey = process.env.INTERNAL_API_KEY;
  const providedKey = request.headers.get("x-internal-key");

  if (!configuredKey || !providedKey) {
    return false;
  }

  const configuredBuffer = Buffer.from(configuredKey);
  const providedBuffer = Buffer.from(providedKey);

  return (
    configuredBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(configuredBuffer, providedBuffer)
  );
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`reindex:${clientIp}`, 5, 300);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Límite de reindexación excedido. Espera ${rateLimit.resetSeconds} segundos.` },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetSeconds) } }
      );
    }

    if (!hasValidInternalKey(request)) {
      await requireAdminSession();
    }

    const result = await SearchService.reindexPublishedPages();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: error.statusCode }
      );
    }

    console.error("Reindex API error:", error);
    return NextResponse.json({ error: "Reindex failed." }, { status: 500 });
  }
}
