import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/services/search-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const limit = Number(searchParams.get("limit"));

    if (!query) {
      return NextResponse.json(
        { error: "The 'q' query parameter is required." },
        { status: 400 }
      );
    }

    const results = await SearchService.searchPages(query, limit);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to execute search." },
      { status: 500 }
    );
  }
}
