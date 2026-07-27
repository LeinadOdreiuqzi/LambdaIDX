import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { buildPublicPageHref } from "@/lib/page-paths";
import { NavPage } from "@/types";

/**
 * Generates a subtle, short numeric ID (e.g., "8472")
 * Ensures uniqueness by checking against existing IDs
 */
async function generateSubtleId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const candidateId = String((timestamp % 10000) + random).slice(-4);

    // Check if this ID already exists
    const existing = await prisma.page.findUnique({
      where: { id: candidateId },
      select: { id: true },
    });

    if (!existing) {
      return candidateId;
    }

    attempts++;
  }

  // Fallback to timestamp-based ID if all attempts fail
  return String(Date.now()).slice(-4);
}

export interface PageContent {
  id: string;
  title: string;
  slug: string;
  contentJson: unknown | null;
  excerpt?: string | null;
  path: string;
  parentId?: string | null;
  status?: string;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export interface BreadcrumbItem {
  title: string;
  slug: string;
  href: string;
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

type ImageLayout = "block-center" | "wrap-left" | "wrap-right";

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

function normalizeImageLayout(layout?: unknown, align?: unknown): ImageLayout {
  if (layout === "wrap-left" || layout === "wrap-right" || layout === "block-center") {
    return layout;
  }

  if (align === "left") return "wrap-left";
  if (align === "right") return "wrap-right";

  return "block-center";
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
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
      const title = (node.attrs?.title as string) || "";
      const width = (node.attrs?.width as string) || "100%";
      const align = (node.attrs?.align as string) || "center";
      const layout = normalizeImageLayout(node.attrs?.layout, align);
      const figureStyle = ` style="--image-width: ${escapeHtml(width)};"`;
      const imageStyle = layout === "block-center" ? ` style="width: ${escapeHtml(width)};"` : "";
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      const caption = alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : "";

      return `<figure data-image-layout="${layout}" data-align="${escapeHtml(align)}"${figureStyle}><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr}${imageStyle} />${caption}</figure>`;
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
        return [];
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

      if (pages.length === 0) return [];

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

  static async getPageBySlug(slug: string): Promise<PageContent | null> {
    try {
      if (!process.env.DATABASE_URL) {
        return null;
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
      console.error(`❌ Failed to fetch page ${slug}:`, error);
      return null;
    }
  }

  /**
   * Fetches a single page by its nested slug path.
   * e.g., ["ciencias-naturales", "quimica", "quimica-organica"]
   */
  static async getPageByNestedSlugs(slugs: string[]): Promise<PageContent | null> {
    try {
      if (!slugs || slugs.length === 0) return null;

      if (!process.env.DATABASE_URL) {
        return null;
      }

      const normalizeSlug = (slug: string): string => {
        return decodeURIComponent(slug)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
      };

      const normalizedSlugs = slugs.map(normalizeSlug);

      const targetSlug = slugs[slugs.length - 1];
      const normalizedTargetSlug = normalizedSlugs[normalizedSlugs.length - 1];

      let page = await prisma.page.findUnique({
        where: { slug: targetSlug, status: "PUBLISHED" },
      });

      if (!page) {
        page = await prisma.page.findFirst({
          where: {
            status: "PUBLISHED",
            slug: {
              equals: normalizedTargetSlug,
              mode: 'insensitive',
            },
          },
        });
      }

      if (!page) return null;

      const breadcrumbs = await this.getBreadcrumbs({ path: page.path, id: page.id });

      const normalizedBreadcrumbs = breadcrumbs.map(b => ({
        ...b,
        slug: normalizeSlug(b.slug),
      }));

      if (normalizedBreadcrumbs.length !== normalizedSlugs.length) {
        if (normalizedBreadcrumbs.length > normalizedSlugs.length) {
          const lastBreadcrumb = normalizedBreadcrumbs[normalizedBreadcrumbs.length - 1];
          if (lastBreadcrumb.slug === normalizedSlugs[normalizedSlugs.length - 1]) {
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
          }
        }
        return null;
      }

      for (let i = 0; i < normalizedSlugs.length; i++) {
        if (normalizedBreadcrumbs[i].slug !== normalizedSlugs[i]) {
          return null;
        }
      }

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
      console.error(`❌ Failed to fetch page by nested slugs [${slugs.join("/")}]:`, error);
      return null;
    }
  }

  /**
   * Returns breadcrumbs for a given page.
   */
  static async getBreadcrumbs(page: { path: string; id: string }): Promise<BreadcrumbItem[]> {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }

      // Handle empty path (legacy pages or root pages)
      if (!page.path || page.path === "") {
        // For pages with empty path, fetch the page itself as the only breadcrumb
        const pageData = await prisma.page.findUnique({
          where: { id: page.id },
          select: {
            id: true,
            title: true,
            slug: true,
          },
        });

        if (pageData) {
          return [
            {
              title: pageData.title,
              slug: pageData.slug,
              href: buildPublicPageHref([pageData.slug]),
            },
          ];
        }
        return [];
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
      const orderedBreadcrumbs = pathSegments
        .map(id => breadcrumbs.find(b => b.id === id))
        .filter((b): b is typeof b & { title: string; slug: string } => !!b)
        .map(b => ({ title: b.title, slug: b.slug }));

      return orderedBreadcrumbs.map((breadcrumb, index) => ({
        ...breadcrumb,
        href: buildPublicPageHref(
          orderedBreadcrumbs.slice(0, index + 1).map((item) => item.slug)
        ),
      }));
    } catch (error) {
      console.error(`❌ Failed to fetch breadcrumbs for path ${page.path}:`, error);
      return [];
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
    const breadcrumbs = segments.map((seg) => ({
      title: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      slug: seg === "mock-1" ? "introduction" : seg === "mock-2" ? "setup-guide" : seg,
    }));

    return breadcrumbs.map((breadcrumb, index) => ({
      ...breadcrumb,
      href: buildPublicPageHref(
        breadcrumbs.slice(0, index + 1).map((item) => item.slug)
      ),
    }));
  }

  /**
   * Fetches a single page by ID (for editing in backend)
   */
  static async getPageById(id: string): Promise<PageContent | null> {
    try {
      if (!process.env.DATABASE_URL) {
        return null;
      }

      const page = await prisma.page.findUnique({
        where: { id },
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
      console.error(`❌ Failed to fetch page ${id}:`, error);
      return null;
    }
  }

  /**
   * Creates a new page
   */
  static async createPage(data: {
    title: string;
    slug: string;
    parentId?: string;
    excerpt?: string;
    contentJson?: Record<string, unknown>;
    metaTitle?: string;
    metaDescription?: string;
  }): Promise<PageContent | null> {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error("Database not configured");
      }

      let path = "";
      let depth = 0;

      if (data.parentId) {
        const parent = await prisma.page.findUnique({
          where: { id: data.parentId },
          select: { path: true, depth: true },
        });

        if (parent) {
          depth = parent.depth + 1;
        }
      }

      // Settle slug collisions dynamically to avoid P2002 Unique Constraint Violation
      let uniqueSlug = data.slug || "untitled";
      let counter = 1;
      while (true) {
        const existing = await prisma.page.findUnique({
          where: { slug: uniqueSlug },
          select: { id: true },
        });
        if (!existing) break;
        uniqueSlug = `${data.slug || "untitled"}-${counter}`;
        counter++;
      }

      // Generate a subtle custom ID
      const customId = await generateSubtleId();

      const page = await prisma.page.create({
        data: {
          id: customId,
          title: data.title,
          slug: uniqueSlug,
          parentId: data.parentId || null,
          path,
          depth,
          excerpt: data.excerpt,
          contentJson: toInputJsonValue(data.contentJson || { type: "doc", content: [] }),
          metaTitle: data.metaTitle || data.title,
          metaDescription: data.metaDescription || data.excerpt,
          status: "DRAFT",
        },
      });

      if (data.parentId) {
        const parent = await prisma.page.findUnique({
          where: { id: data.parentId },
          select: { path: true },
        });

        if (parent && parent.path) {
          path = `${parent.path}/${page.id}`;
          await prisma.page.update({
            where: { id: page.id },
            data: { path },
          });
          page.path = path;
        }
      } else {
        path = page.id;
        await prisma.page.update({
          where: { id: page.id },
          data: { path },
        });
        page.path = path;
      }

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
      console.error("❌ Failed to create page:", error);
      return null;
    }
  }

  /**
   * Updates page content (editor save)
   */
  static async updatePageContent(
    id: string,
    contentJson: Record<string, unknown>,
    excerpt?: string
  ): Promise<PageContent | null> {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error("Database not configured");
      }

      const page = await prisma.page.update({
        where: { id },
        data: {
          contentJson: toInputJsonValue(contentJson),
          excerpt: excerpt || undefined,
          updatedAt: new Date(),
        },
      });

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
      console.error(`❌ Failed to update page ${id}:`, error);
      return null;
    }
  }

  /**
   * Publishes a page (changes status to PUBLISHED)
   */
  static async publishPage(id: string): Promise<PageContent | null> {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error("Database not configured");
      }

      const page = await prisma.page.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
      });

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
      console.error(`❌ Failed to publish page ${id}:`, error);
      return null;
    }
  }

  /**
   * Updates page metadata
   */
  static async updatePageMetadata(
    id: string,
    data: {
      title?: string;
      metaTitle?: string;
      metaDescription?: string;
      canonicalUrl?: string;
      isFeatured?: boolean;
    }
  ): Promise<PageContent | null> {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error("Database not configured");
      }

      const page = await prisma.page.update({
        where: { id },
        data: {
          title: data.title,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          canonicalUrl: data.canonicalUrl,
          isFeatured: data.isFeatured,
          updatedAt: new Date(),
        },
      });

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
      console.error(`❌ Failed to update page metadata ${id}:`, error);
      return null;
    }
  }

  /**
   * Deletes a page
   */
  static async deletePage(id: string): Promise<boolean> {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error("Database not configured");
      }

      await prisma.$transaction(async (tx) => {
        const page = await tx.page.findUnique({
          where: { id },
          select: {
            id: true,
            path: true,
            depth: true,
          },
        });

        if (!page) {
          throw new Error("Page not found");
        }

        const descendantPathPrefix = `${page.path}/`;

        // Promote direct children to root level and repair the whole descendant subtree
        // by removing the deleted node's path prefix.
        await tx.$executeRawUnsafe(
          `UPDATE "Page"
           SET
             path = REPLACE(path, $1, ''),
             depth = depth - $2
           WHERE path LIKE $3`,
          descendantPathPrefix,
          page.depth + 1,
          `${descendantPathPrefix}%`
        );

        await tx.page.updateMany({
          where: { parentId: id },
          data: { parentId: null },
        });

        await tx.page.delete({
          where: { id },
        });
      });

      return true;
    } catch (error) {
      console.error(`❌ Failed to delete page ${id}:`, error);
      return false;
    }
  }

  /**
   * Updates page hierarchy (parent and sort order)
   * Ensures all descendant materialized paths and depths are updated recursively in a transaction.
   * Incorporates safeguards against circular references (e.g., placing a parent under its own child).
   */
  static async updatePageHierarchy(
    id: string,
    data: { parentId?: string | null; sortOrder?: number }
  ): Promise<PageContent | null> {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error("Database not configured");
      }

      return await prisma.$transaction(async (tx) => {
        const page = await tx.page.findUnique({
          where: { id },
          select: { id: true, path: true, depth: true, parentId: true }
        });

        if (!page) {
          return null;
        }

        const parentId = data.parentId !== undefined ? data.parentId : page.parentId;
        let newPath = id;
        let newDepth = 0;

        if (parentId) {
          if (parentId === id) {
            throw new Error("A page cannot be its own parent.");
          }

          const parent = await tx.page.findUnique({
            where: { id: parentId },
            select: { path: true, depth: true }
          });

          if (parent) {
            // Safeguard: Check if the new parent is a descendant of this page
            if (page.path && parent.path.startsWith(`${page.path}/`)) {
              throw new Error("A page cannot be moved under one of its own subpages/descendants.");
            }

            newPath = parent.path ? `${parent.path}/${id}` : id;
            newDepth = parent.depth + 1;
          }
        }

        // If the parent has changed, we must recursively update all descendants' paths and depths
        if (parentId !== page.parentId && page.path) {
          const oldPathPrefix = `${page.path}/`;
          const newPathPrefix = `${newPath}/`;
          const depthDiff = newDepth - page.depth;

          // Perform a fast batch update on all descendants using safe parameterized raw SQL execution
          await tx.$executeRawUnsafe(
            `UPDATE "Page"
             SET 
               path = REPLACE(path, $1, $2),
               depth = depth + $3
             WHERE path LIKE $4`,
            oldPathPrefix,
            newPathPrefix,
            depthDiff,
            `${oldPathPrefix}%`
          );
        }

        // Update the target page itself
        const updatedPage = await tx.page.update({
          where: { id },
          data: {
            parentId,
            path: newPath,
            depth: newDepth,
            sortOrder: data.sortOrder !== undefined ? data.sortOrder : undefined,
          },
        });

        return {
          id: updatedPage.id,
          title: updatedPage.title,
          slug: updatedPage.slug,
          contentJson: updatedPage.contentJson,
          excerpt: updatedPage.excerpt,
          path: updatedPage.path,
          parentId: updatedPage.parentId,
          status: updatedPage.status,
        };
      });
    } catch (error) {
      console.error(`❌ Failed to update page hierarchy ${id}:`, error);
      return null;
    }
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
