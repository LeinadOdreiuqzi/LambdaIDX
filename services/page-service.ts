import prisma from "@/lib/prisma";
import { NavPage } from "@/types";

export class PageService {
  /**
   * Fetches the entire page hierarchy and returns it as a tree.
   * Fallback to mock data if the database is not configured.
   */
  static async getHierarchyTree(): Promise<NavPage[]> {
    try {
      // Check if DB is configured (basic check)
      if (!process.env.DATABASE_URL) {
        return this.getMockHierarchy();
      }

      const pages = await prisma.page.findMany({
        where: {
          status: "PUBLISHED",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          parentId: true,
          path: true,
          depth: true,
          sortOrder: true,
        },
        orderBy: [
          { depth: 'asc' },
          { sortOrder: 'asc' },
        ],
      });

      if (pages.length === 0) return this.getMockHierarchy();

      const pageMap: Record<string, NavPage> = {};
      const rootNodes: NavPage[] = [];

      pages.forEach((page) => {
        pageMap[page.id] = { ...page, children: [] };
      });

      pages.forEach((page) => {
        const navPage = pageMap[page.id];
        if (page.parentId && pageMap[page.parentId]) {
          pageMap[page.parentId].children.push(navPage);
        } else if (!page.parentId) {
          rootNodes.push(navPage);
        }
      });

      return rootNodes;
    } catch (error) {
      console.warn("❌ Prisma fetch failed, using mock data:", error);
      return this.getMockHierarchy();
    }
  }

  /**
   * Fetches a single page by its slug.
   */
  static async getPageBySlug(slug: string) {
    try {
      if (!process.env.DATABASE_URL) {
        return this.getMockPage(slug);
      }

      const page = await prisma.page.findUnique({
        where: { slug, status: "PUBLISHED" },
      });

      return page;
    } catch (error) {
      console.warn(`❌ Failed to fetch page ${slug}, using mock fallback:`, error);
      return this.getMockPage(slug);
    }
  }

  /**
   * Returns breadcrumbs for a given page.
   */
  static async getBreadcrumbs(page: { path: string }) {
    try {
      if (!process.env.DATABASE_URL) {
        return this.getMockBreadcrumbs(page.path);
      }

      const pathSegments = page.path.split('/');
      const breadcrumbs = await prisma.page.findMany({
        where: {
          id: { in: pathSegments },
        },
        select: {
          title: true,
          slug: true,
        },
      });

      // Maintain order based on path segments
      return pathSegments.map(id => breadcrumbs.find(b => (b as any).id === id) || null).filter(Boolean);
    } catch (error) {
      return this.getMockBreadcrumbs(page.path);
    }
  }

  private static getMockPage(slug: string) {
    const mockData: Record<string, any> = {
      "introduction": { title: "Introduction", content: "Welcome to LambdaIDX. This is a knowledge platform designed for deep hierarchies.", path: "mock-1" },
      "what-is-lambdaidx": { title: "What is LambdaIDX?", content: "LambdaIDX is a modern wiki platform...", path: "mock-1/mock-1-1" },
      "setup-guide": { title: "Setup Guide", content: "Learn how to set up LambdaIDX...", path: "mock-2" },
      "environment-variables": { title: "Environment Variables", content: "You need a DATABASE_URL to start...", path: "mock-2/mock-2-1" },
      "database-config": { title: "Database Configuration", content: "Configuring Prisma 7...", path: "mock-2/mock-2-2" },
    };
    return mockData[slug] || null;
  }

  private static getMockBreadcrumbs(path: string) {
    const segments = path.split('/');
    return segments.map((seg, i) => ({
      title: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      slug: seg === "mock-1" ? "introduction" : seg === "mock-2" ? "setup-guide" : seg,
    }));
  }

  private static getMockHierarchy(): NavPage[] {
    return [
      {
        id: "mock-1",
        title: "Introduction",
        slug: "introduction",
        parentId: null,
        path: "mock-1",
        depth: 0,
        sortOrder: 0,
        children: [
          {
            id: "mock-1-1",
            title: "What is LambdaIDX?",
            slug: "what-is-lambdaidx",
            parentId: "mock-1",
            path: "mock-1/mock-1-1",
            depth: 1,
            sortOrder: 0,
            children: [],
          },
        ],
      },
      {
        id: "mock-2",
        title: "Setup Guide",
        slug: "setup-guide",
        parentId: null,
        path: "mock-2",
        depth: 0,
        sortOrder: 1,
        children: [
          {
            id: "mock-2-1",
            title: "Environment Variables",
            slug: "environment-variables",
            parentId: "mock-2",
            path: "mock-2/mock-2-1",
            depth: 1,
            sortOrder: 0,
            children: [],
          },
          {
            id: "mock-2-2",
            title: "Database Configuration",
            slug: "database-config",
            parentId: "mock-2",
            path: "mock-2/mock-2-2",
            depth: 1,
            sortOrder: 1,
            children: [],
          },
        ],
      },
    ];
  }
}
