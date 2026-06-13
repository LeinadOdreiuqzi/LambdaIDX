import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";
import { revalidatePath } from "next/cache";
import { idSchema, updatePageHierarchySchema, validateBody } from "@/lib/validation";

/**
 * PATCH /api/pages/[id]/hierarchy - Update page hierarchy (parent, position)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    const idValidation = idSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = validateBody(updatePageHierarchySchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const updated = await PageService.updatePageHierarchy(idValidation.data, validation.data);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update hierarchy" },
        { status: 500 }
      );
    }

    revalidatePath("/", "layout");

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
