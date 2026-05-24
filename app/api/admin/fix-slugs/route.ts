import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/services/page-service";

/**
 * POST /api/admin/fix-slugs - Fix slugs by removing accents from all pages
 */
export async function POST(request: NextRequest) {
  try {
    const prisma = (await import("@/lib/prisma")).default;
    
    console.log("🔍 Fetching all pages...");
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    console.log(`📊 Found ${pages.length} pages`);

    let fixedCount = 0;
    let skippedCount = 0;

    function slugify(text: string): string {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
        .trim();
    }

    for (const page of pages) {
      const newSlug = slugify(page.title);
      
      if (newSlug !== page.slug) {
        console.log(`🔄 Fixing: "${page.title}"`);
        console.log(`   Old slug: ${page.slug}`);
        console.log(`   New slug: ${newSlug}`);
        
        await prisma.page.update({
          where: { id: page.id },
          data: { slug: newSlug },
        });
        
        fixedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} slugs`);
    console.log(`⏭️  Skipped ${skippedCount} slugs (already correct)`);

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} slugs, skipped ${skippedCount}`,
      fixedCount,
      skippedCount,
    });
  } catch (error) {
    console.error("❌ Error fixing slugs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fix slugs" },
      { status: 500 }
    );
  }
}
