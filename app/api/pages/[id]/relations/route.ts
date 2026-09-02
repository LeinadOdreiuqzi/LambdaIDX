import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";
import { idSchema } from "@/lib/validation";
import { RelationType, ResourceType } from "@prisma/client";
import { requireAdminSession, AuthError } from "@/lib/auth";

/**
 * GET /api/pages/[id]/relations - Fetch relations, tags, and resources for a page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();

    const { id } = await params;

    const idValidation = idSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const data = await PageService.getRelationsAndResources(idValidation.data, true);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("GET /api/pages/[id]/relations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch relations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pages/[id]/relations - Mutate relations, tags, or resources for a page (Admin Protected)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validar sesion de administrador
    await requireAdminSession();

    const { id } = await params;

    const idValidation = idSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, payload } = body;

    const pageId = idValidation.data;

    switch (action) {
      case "add_relation": {
        const { targetId, type } = payload || {};
        if (!targetId) {
          return NextResponse.json({ success: false, error: "Missing targetId" }, { status: 400 });
        }
        const rel = await PageService.addPageRelation(pageId, targetId, (type as RelationType) || "RELATED");
        return NextResponse.json({ success: true, data: rel });
      }

      case "remove_relation": {
        const { targetId, type } = payload || {};
        if (!targetId) {
          return NextResponse.json({ success: false, error: "Missing targetId" }, { status: 400 });
        }
        const res = await PageService.removePageRelation(pageId, targetId, (type as RelationType) || "RELATED");
        return NextResponse.json({ success: true, data: res });
      }

      case "add_tag": {
        const { tag } = payload || {};
        if (!tag) {
          return NextResponse.json({ success: false, error: "Missing tag name" }, { status: 400 });
        }
        const createdTag = await PageService.addPageTag(pageId, tag);
        return NextResponse.json({ success: true, data: createdTag });
      }

      case "remove_tag": {
        const { tag } = payload || {};
        if (!tag) {
          return NextResponse.json({ success: false, error: "Missing tag name" }, { status: 400 });
        }
        const res = await PageService.removePageTag(pageId, tag);
        return NextResponse.json({ success: true, data: res });
      }

      case "add_resource": {
        const { title, url, type, description } = payload || {};
        if (!title || !url) {
          return NextResponse.json({ success: false, error: "Missing title or url" }, { status: 400 });
        }
        const res = await PageService.addPageResource(pageId, {
          title,
          url,
          type: (type as ResourceType) || "WEBSITE",
          description,
        });
        return NextResponse.json({ success: true, data: res });
      }

      case "remove_resource": {
        const { resourceId } = payload || {};
        if (!resourceId) {
          return NextResponse.json({ success: false, error: "Missing resourceId" }, { status: 400 });
        }
        const res = await PageService.removePageResource(resourceId);
        return NextResponse.json({ success: true, data: res });
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("POST /api/pages/[id]/relations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process relation mutation" },
      { status: 500 }
    );
  }
}
