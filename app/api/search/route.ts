import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/services/search-service";
import { searchSchema, validateQuery } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Rate limit: Max 60 busquedas por minuto por IP
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`search:${clientIp}`, 60, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Limite de busquedas excedido. Espera ${rateLimit.resetSeconds} segundos.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSeconds),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const limit = searchParams.get("limit") || undefined;

    // Validate query parameters
    const validation = validateQuery(searchSchema, { query, limit });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const results = await SearchService.searchPages(validation.data.query, validation.data.limit);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to execute search." },
      { status: 500 }
    );
  }
}
