import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/services/search-service";

function isAuthorized(request: NextRequest) {
  const apiKey = process.env.INTERNAL_API_KEY;

  if (!apiKey) {
    return true;
  }

  const headerValue = request.headers.get("x-internal-key");
  return headerValue === apiKey;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const result = await SearchService.reindexPublishedPages();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("Reindex API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reindex failed." },
      { status: 500 }
    );
  }
}
