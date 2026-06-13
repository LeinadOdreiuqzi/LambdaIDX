import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";
import { revalidatePath } from "next/cache";
import { createPageSchema, validateBody } from "@/lib/validation";

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

    // Validate request body
    const validation = validateBody(createPageSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const page = await PageService.createPage(validation.data);

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Failed to create page" },
        { status: 500 }
      );
    }

    revalidatePath("/", "layout");

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
