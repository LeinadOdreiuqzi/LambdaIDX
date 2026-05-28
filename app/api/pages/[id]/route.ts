import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";
import { revalidatePath } from "next/cache";

/**
 * GET /api/pages/[id] - Get a single page by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = await PageService.getPageById(id);

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
    console.error("❌ GET /api/pages/[id] error:", error);
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
    const body = await request.json();
    const { contentJson, excerpt, title, metaTitle, metaDescription, canonicalUrl, isFeatured } = body;

    // Update content
    if (contentJson !== undefined) {
      const updated = await PageService.updatePageContent(id, contentJson, excerpt);

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
    if (title || metaTitle || metaDescription || canonicalUrl !== undefined || isFeatured !== undefined) {
      const updated = await PageService.updatePageMetadata(id, {
        title: title || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        canonicalUrl: canonicalUrl || undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
      });

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
    console.error("❌ PUT /api/pages/[id] error:", error);
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

    const success = await PageService.deletePage(id);

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
    console.error("❌ DELETE /api/pages/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
