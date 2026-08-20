import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";
import { revalidatePath } from "next/cache";
import { idSchema } from "@/lib/validation";
import { requireAdminSession, AuthError } from "@/lib/auth";

/**
 * POST /api/pages/[id]/publish - Publish a page (Admin Protected)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validar sesion de administrador
    await requireAdminSession();

    const { id } = await params;

    // Validate ID format
    const idValidation = idSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const page = await PageService.publishPage(idValidation.data);

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Failed to publish page or page not found" },
        { status: 500 }
      );
    }

    revalidatePath(`/index/${page.slug}`);
    revalidatePath("/", "layout");
    revalidatePath("/index", "layout");

    return NextResponse.json({
      success: true,
      data: page,
      message: `Page "${page.title}" published successfully`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("POST /api/pages/[id]/publish error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish page" },
      { status: 500 }
    );
  }
}
