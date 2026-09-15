import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { PageStatus } from "@prisma/client";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://lambdaidx.dpdns.org");

export const revalidate = 3600; // Revalidate sitemaps every hour
const SITEMAP_ITEMS_PER_PAGE = 2000; // Number of items per sitemap chunk (max 50,000 per spec)

/**
 * Next.js App Router generateSitemaps:
 * Automatically builds a /sitemap.xml index pointing to /sitemap/0.xml, /sitemap/1.xml, etc.
 * Handles scaling to tens of thousands of knowledge pages without exceeding memory or XML size limits.
 */
export async function generateSitemaps() {
  try {
    if (!process.env.DATABASE_URL) {
      return [{ id: 0 }];
    }

    const totalPublished = await prisma.page.count({
      where: { status: PageStatus.PUBLISHED },
    });

    const totalPages = Math.max(1, Math.ceil(totalPublished / SITEMAP_ITEMS_PER_PAGE));
    return Array.from({ length: totalPages }, (_, i) => ({ id: i }));
  } catch (error) {
    console.warn("Failed to calculate sitemap count, defaulting to single sitemap:", error);
    return [{ id: 0 }];
  }
}

export default async function sitemap({
  id,
}: {
  id: Promise<{ id: string }> | { id: number | string };
}): Promise<MetadataRoute.Sitemap> {
  const resolvedId = await Promise.resolve(id);
  const pageIndex = Number(typeof resolvedId === "object" && resolvedId !== null ? resolvedId.id : resolvedId) || 0;

  const staticRoutes: MetadataRoute.Sitemap =
    pageIndex === 0
      ? [
          {
            url: `${BASE_URL}`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
          },
          {
            url: `${BASE_URL}/login`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.2,
          },
        ]
      : [];

  try {
    if (!process.env.DATABASE_URL) {
      return staticRoutes;
    }

    const publishedPages = await prisma.page.findMany({
      where: {
        status: PageStatus.PUBLISHED,
      },
      select: {
        slug: true,
        path: true,
        depth: true,
        isFeatured: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: {
        depth: "asc",
      },
      skip: pageIndex * SITEMAP_ITEMS_PER_PAGE,
      take: SITEMAP_ITEMS_PER_PAGE,
    });

    const dynamicRoutes: MetadataRoute.Sitemap = publishedPages.map((page) => {
      let priority = 0.7;
      if (page.depth === 0) priority = 0.9;
      else if (page.depth === 1) priority = 0.8;
      else if (page.depth >= 3) priority = 0.5;

      if (page.isFeatured) {
        priority = Math.min(1.0, priority + 0.1);
      }

      const pageUrl = page.path.startsWith("/index/")
        ? `${BASE_URL}${page.path}`
        : `${BASE_URL}/index/${page.slug}`;

      return {
        url: pageUrl,
        lastModified: page.updatedAt || page.createdAt || new Date(),
        changeFrequency: page.depth <= 1 ? "daily" : "weekly",
        priority,
      };
    });

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error(`Error generating dynamic sitemap page ${pageIndex}:`, error);
    return staticRoutes;
  }
}
