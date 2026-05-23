import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";

/**
 * POST /api/pages/[id]/publish - Publish a page
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await PageService.publishPage(id);

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Failed to publish page or page not found" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page,
      message: `Page "${page.title}" published successfully`,
    });
  } catch (error) {
    console.error("❌ POST /api/pages/[id]/publish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish page" },
      { status: 500 }
    );
  }
}
