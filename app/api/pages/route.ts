import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";
import { revalidatePath } from "next/cache";
import { createPageSchema, validateBody } from "@/lib/validation";
import { requireAdminSession, AuthError } from "@/lib/auth";

/**
 * GET /api/pages - List pages (optionally filtered)
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
    console.error("GET /api/pages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pages - Create a new page (Admin Protected)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar sesion de administrador
    await requireAdminSession();

    const body = await request.json();

    // 2. Validate request body
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
    revalidatePath("/p", "layout");

    return NextResponse.json(
      {
        success: true,
        data: page,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("POST /api/pages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create page" },
      { status: 500 }
    );
  }
}
