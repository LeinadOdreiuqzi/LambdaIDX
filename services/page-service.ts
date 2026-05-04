import prisma from "@/lib/prisma";
import { NavPage } from "@/types";

export interface PageContent {
  id: string;
  title: string;
  slug: string;
  contentJson: unknown | null;
  excerpt?: string | null;
  path: string;
  parentId?: string | null;
  status?: string;
}

export interface BreadcrumbItem {
  title: string;
  slug: string;
}

// TipTap JSON types
interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

interface TipTapDoc {
  type: "doc";
  content: TipTapNode[];
}

/**
 * Renders TipTap JSON to HTML string.
 * Supports: paragraph, heading, bulletList, listItem, codeBlock, text with marks (bold, code)
 */
export function renderTipTapToHtml(contentJson: unknown | null): string {
  if (!contentJson) return "";

  const doc = contentJson as TipTapDoc;
  if (!doc.content || !Array.isArray(doc.content)) return "";

  return doc.content.map(renderNode).join("");
}

function renderNode(node: TipTapNode): string {
  switch (node.type) {
    case "paragraph":
      return `<p>${renderContent(node.content)}</p>`;
    case "heading":
      const level = (node.attrs?.level as number) || 1;
      return `<h${level} id="${slugify(renderPlainText(node.content))}">${renderContent(node.content)}</h${level}>`;
    case "bulletList":
      return `<ul>${node.content?.map(renderNode).join("") || ""}</ul>`;
    case "listItem":
      return `<li>${renderContent(node.content)}</li>`;
    case "codeBlock":
      return `<pre><code>${escapeHtml(renderPlainText(node.content))}</code></pre>`;
    case "image":
      const src = (node.attrs?.src as string) || "";
      const alt = (node.attrs?.alt as string) || "";
      return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" /><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
    default:
      return renderContent(node.content);
  }
}

function renderContent(content: TipTapNode[] | undefined): string {
  if (!content) return "";
  return content.map(child => {
    if (child.text !== undefined) {
      return renderText(child);
    }
    return renderNode(child);
  }).join("");
}

function renderText(node: TipTapNode): string {
  let text = escapeHtml(node.text || "");
  const marks = node.marks || [];

  // Apply marks in reverse order to maintain proper nesting
  [...marks].reverse().forEach(mark => {
    switch (mark.type) {
      case "bold":
        text = `<strong>${text}</strong>`;
        break;
      case "italic":
        text = `<em>${text}</em>`;
        break;
      case "code":
        text = `<code>${text}</code>`;
        break;
      case "link":
        const href = (mark.attrs?.href as string) || "#";
        text = `<a href="${escapeHtml(href)}">${text}</a>`;
        break;
    }
  });

  return text;
}

function renderPlainText(content: TipTapNode[] | undefined): string {
  if (!content) return "";
  return content.map(node => {
    if (node.text !== undefined) return node.text;
    return renderPlainText(node.content);
  }).join("");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export class PageService {
  /**
   * Fetches the page hierarchy.
   * @param includeAll If true, fetches all pages regardless of status (for admin)
   */
  static async getHierarchyTree(includeAll = false): Promise<NavPage[]> {
    try {
      // Check if DB is configured (basic check)
      if (!process.env.DATABASE_URL) {
        return this.getMockHierarchy();
      }

      const whereClause = includeAll ? {} : { status: "PUBLISHED" as const };

      const pages = await prisma.page.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          slug: true,
          parentId: true,
          path: true,
          depth: true,
          sortOrder: true,
          status: true,
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
  static async getPageBySlug(slug: string): Promise<PageContent | null> {
    try {
      if (!process.env.DATABASE_URL) {
        return this.getMockPage(slug);
      }

      const page = await prisma.page.findUnique({
        where: { slug, status: "PUBLISHED" },
      });

      if (!page) return null;

      return {
        id: page.id,
        title: page.title,
        slug: page.slug,
        contentJson: page.contentJson,
        excerpt: page.excerpt,
        path: page.path,
        parentId: page.parentId,
        status: page.status,
      };
    } catch (error) {
      console.warn(`❌ Failed to fetch page ${slug}, using mock fallback:`, error);
      return this.getMockPage(slug);
    }
  }

  /**
   * Returns breadcrumbs for a given page.
   */
  static async getBreadcrumbs(page: { path: string }): Promise<BreadcrumbItem[]> {
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
          id: true,
          title: true,
          slug: true,
        },
      });

      // Maintain order based on path segments and map to BreadcrumbItem
      return pathSegments
        .map(id => breadcrumbs.find(b => b.id === id))
        .filter((b): b is typeof b & { title: string; slug: string } => !!b)
        .map(b => ({ title: b.title, slug: b.slug }));
    } catch (error) {
      return this.getMockBreadcrumbs(page.path);
    }
  }

  private static getMockPage(slug: string): PageContent | null {
    const mockData: Record<string, PageContent> = {
      "introduction": {
        id: "mock-1",
        title: "Introduction",
        slug: "introduction",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "paragraph", content: [
                { type: "text", text: "Welcome to " },
                { type: "text", marks: [{ type: "bold" }], text: "LambdaIDX" },
                { type: "text", text: ". This is a next-generation knowledge platform designed for high-performance navigation and deep hierarchies." }
              ]
            },
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "The Mission" }] },
            { type: "paragraph", content: [{ type: "text", text: "Our goal is to transform chaotic information into a structured, industrial-grade knowledge base that remains lightning-fast regardless of size." }] },
            { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Speed First" }] },
            { type: "paragraph", content: [{ type: "text", text: "Every interaction is optimized for zero latency. Hierarchical exploration should feel like an extension of your thought process." }] },
            { type: "image", attrs: { src: "https://www.nasa.gov/wp-content/uploads/2026/04/art002e000192.jpg", alt: "Hello, World - Artemis II " } },
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Core Pillars" }] },
            {
              type: "bulletList", content: [
                {
                  type: "listItem", content: [{
                    type: "paragraph", content: [
                      { type: "text", marks: [{ type: "bold" }], text: "Hierarchical Clarity" },
                      { type: "text", text: ": Deep nesting support." }
                    ]
                  }]
                },
                {
                  type: "listItem", content: [{
                    type: "paragraph", content: [
                      { type: "text", marks: [{ type: "bold" }], text: "SEO Optimized" },
                      { type: "text", text: ": Every page is indexable." }
                    ]
                  }]
                },
                {
                  type: "listItem", content: [{
                    type: "paragraph", content: [
                      { type: "text", marks: [{ type: "bold" }], text: "Premium Reading" },
                      { type: "text", text: ": Focused, distraction-free UI." }
                    ]
                  }]
                }
              ]
            }
          ]
        },
        path: "mock-1",
        parentId: null,
        status: "PUBLISHED",
      },
      "what-is-lambdaidx": {
        id: "mock-1-1",
        title: "What is LambdaIDX?",
        slug: "what-is-lambdaidx",
        contentJson: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "LambdaIDX is more than a wiki; it is a specialized engine for structured data relationships." }] },
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Architectural Depth" }] },
            { type: "paragraph", content: [{ type: "text", text: "Unlike flat wikis, we treat knowledge as a recursive tree. This allows for unparalleled organization." }] },
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Technology Stack" }] },
            { type: "paragraph", content: [{ type: "text", text: "Built with Next.js, TypeScript, and Prisma 7 for long-term scalability." }] }
          ]
        },
        path: "mock-1/mock-1-1",
        parentId: "mock-1",
        status: "PUBLISHED",
      },
      "setup-guide": {
        id: "mock-2",
        title: "Setup Guide",
        slug: "setup-guide",
        contentJson: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Follow these steps to initialize your LambdaIDX environment." }] },
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Environment" }] },
            { type: "paragraph", content: [{ type: "text", text: "Ensure you have Node.js 18+ and a PostgreSQL instance ready." }] },
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Initialization" }] },
            {
              type: "paragraph", content: [
                { type: "text", text: "Run " },
                { type: "text", marks: [{ type: "code" }], text: "npm install" },
                { type: "text", text: " followed by " },
                { type: "text", marks: [{ type: "code" }], text: "npx prisma generate" },
                { type: "text", text: "." }
              ]
            }
          ]
        },
        path: "mock-2",
        parentId: null,
        status: "PUBLISHED",
      },
      "environment-variables": {
        id: "mock-2-1",
        title: "Environment Variables",
        slug: "environment-variables",
        contentJson: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Required secrets for your .env file." }] },
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Database" }] },
            { type: "codeBlock", attrs: { language: null }, content: [{ type: "text", text: 'DATABASE_URL="postgresql://..."' }] }
          ]
        },
        path: "mock-2/mock-2-1",
        parentId: "mock-2",
        status: "PUBLISHED",
      },
      "database-config": {
        id: "mock-2-2",
        title: "Database Configuration",
        slug: "database-config",
        contentJson: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Advanced mapping and schemas for hierarchical nodes." }] }
          ]
        },
        path: "mock-2/mock-2-2",
        parentId: "mock-2",
        status: "PUBLISHED",
      },
    };
    return mockData[slug] || null;
  }

  private static getMockBreadcrumbs(path: string): BreadcrumbItem[] {
    const segments = path.split('/');
    return segments.map((seg) => ({
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
        status: 'PUBLISHED',
        children: [
          {
            id: "mock-1-1",
            title: "What is LambdaIDX?",
            slug: "what-is-lambdaidx",
            parentId: "mock-1",
            path: "mock-1/mock-1-1",
            depth: 1,
            sortOrder: 0,
            status: 'PUBLISHED',
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
        status: 'PUBLISHED',
        children: [
          {
            id: "mock-2-1",
            title: "Environment Variables",
            slug: "environment-variables",
            parentId: "mock-2",
            path: "mock-2/mock-2-1",
            depth: 1,
            sortOrder: 0,
            status: 'PUBLISHED',
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
            status: 'PUBLISHED',
            children: [],
          },
        ],
      },
    ];
  }
}
