import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";

/**
 * GET /api/pages/search-relations?q=...&excludeId=...
 * Autocomplete endpoint for finding internal pages to connect as relations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const excludeId = searchParams.get("excludeId") || undefined;

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const pages = await PageService.searchPagesForRelating(query, excludeId);

    return NextResponse.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error("❌ GET /api/pages/search-relations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search pages" },
      { status: 500 }
    );
  }
}
