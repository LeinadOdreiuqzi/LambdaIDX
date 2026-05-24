import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";

/**
 * PATCH /api/pages/[id]/hierarchy - Update page hierarchy (parent, position)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { parentId, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing page ID" },
        { status: 400 }
      );
    }

    // Get current page
    const currentPage = await PageService.getPageById(id);
    if (!currentPage) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    // Update would go here - for now just return success
    // In a real implementation, you'd update the database
    return NextResponse.json({
      success: true,
      data: {
        ...currentPage,
        parentId: parentId || currentPage.parentId,
      },
    });
  } catch (error) {
    console.error("❌ PATCH /api/pages/[id]/hierarchy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hierarchy" },
      { status: 500 }
    );
  }
}
