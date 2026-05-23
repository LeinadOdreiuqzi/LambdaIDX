import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";

/**
 * GET /api/pages - List pages (admin only, optionally filtered)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeAll = searchParams.get("all") === "true";

    const hierarchy = await PageService.getHierarchyTree(includeAll);

    return NextResponse.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    console.error("❌ GET /api/pages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pages - Create a new page
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, parentId, excerpt, contentJson, metaTitle, metaDescription } = body;

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, slug" },
        { status: 400 }
      );
    }

    const page = await PageService.createPage({
      title,
      slug,
      parentId: parentId || undefined,
      excerpt: excerpt || undefined,
      contentJson: contentJson || undefined,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Failed to create page" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: page,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST /api/pages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create page" },
      { status: 500 }
    );
  }
}
