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

    const updated = await PageService.updatePageHierarchy(id, {
      parentId,
      sortOrder,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update hierarchy" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/pages/[id]/hierarchy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hierarchy" },
      { status: 500 }
    );
  }
}
