import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";
import { revalidatePath } from "next/cache";
import { idSchema, updatePageContentSchema, updatePageMetadataSchema, validateBody } from "@/lib/validation";

/**
 * GET /api/pages/[id] - Get a single page by ID
 */
export async function GET(
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

    const page = await PageService.getPageById(idValidation.data);

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("GET /api/pages/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch page" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pages/[id] - Update page content (from editor)
 */
export async function PUT(
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

    // Update content
    if (body.contentJson !== undefined || body.excerpt !== undefined) {
      const validation = validateBody(updatePageContentSchema, body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      const updated = await PageService.updatePageContent(idValidation.data, validation.data.contentJson || { type: "doc", content: [] }, validation.data.excerpt);

      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Failed to update page content" },
          { status: 500 }
        );
      }

      revalidatePath("/", "layout");

      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    // Update metadata
    if (body.title || body.metaTitle || body.metaDescription || body.canonicalUrl !== undefined || body.isFeatured !== undefined) {
      const validation = validateBody(updatePageMetadataSchema, body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      const updated = await PageService.updatePageMetadata(idValidation.data, validation.data);

      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Failed to update page metadata" },
          { status: 500 }
        );
      }

      revalidatePath("/", "layout");

      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: "No fields to update" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PUT /api/pages/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update page" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pages/[id] - Delete a page
 */
export async function DELETE(
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

    const success = await PageService.deletePage(idValidation.data);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete page" },
        { status: 500 }
      );
    }

    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/pages/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
