import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { PageStatus } from "@prisma/client";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lambdaidx.com";

export const revalidate = 3600; // Revalidar el sitemap cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
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
  ];

  try {
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
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
