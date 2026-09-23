import prisma from "@/lib/prisma";
import { Prisma, RelationType, ResourceType } from "@prisma/client";
import { buildPublicPageHref } from "@/lib/page-paths";
import { NavPage, PageContent, BreadcrumbItem } from "@/types";
export type { PageContent, BreadcrumbItem };
import { CacheService, RELATIONS_TTL } from "./cache-service";
import { getMockPage, getMockBreadcrumbs, getMockHierarchy } from "./mocks/mock-pages";

import crypto from "crypto";

/**
 * Generates a clean, collision-resistant ID (e.g., "e8f3a9b2c1d4")
 * Eliminates database roundtrips and handles scaling to millions of pages with 0 latency.
 */
function generateSubtleId(): string {
  return crypto.randomBytes(6).toString("hex");
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

export function extractPlainTextFromTipTap(contentJson: unknown): string {
  if (!contentJson || typeof contentJson !== "object") {
    return "";
  }

  function walk(node: Record<string, unknown>): string {
    const ownText = (node.text as string) || "";
    const children = (node.content as Record<string, unknown>[]) || [];
    const childrenText = children.map(walk).join(" ");
    return `${ownText} ${childrenText}`.trim();
  }

  const text = walk(contentJson as Record<string, unknown>).trim();
  return text.replace(/\s+/g, " ");
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
    case "heading": {
      const level = (node.attrs?.level as number) || 1;
      return `<h${level} id="${slugify(renderPlainText(node.content))}">${renderContent(node.content)}</h${level}>`;
    }
    case "bulletList":
      return `<ul>${node.content?.map(renderNode).join("") || ""}</ul>`;
    case "orderedList":
      return `<ol>${node.content?.map(renderNode).join("") || ""}</ol>`;
    case "listItem":
      return `<li>${renderContent(node.content)}</li>`;
    case "taskList":
      return `<ul class="task-list">${node.content?.map(renderNode).join("") || ""}</ul>`;
    case "taskItem":
      return `<li class="task-item">${renderContent(node.content)}</li>`;
    case "blockquote":
      return `<blockquote>${renderContent(node.content)}</blockquote>`;
    case "horizontalRule":
      return `<hr />`;
    case "codeBlock":
      return `<pre><code>${escapeHtml(renderPlainText(node.content))}</code></pre>`;
    case "table":
      return `<table><tbody>${node.content?.map(renderNode).join("") || ""}</tbody></table>`;
    case "tableRow":
      return `<tr>${node.content?.map(renderNode).join("") || ""}</tr>`;
    case "tableHeader":
      return `<th>${renderContent(node.content)}</th>`;
    case "tableCell":
      return `<td>${renderContent(node.content)}</td>`;
    case "callout": {
      const type = (node.attrs?.type as string) || "info";
      return `<div class="callout callout-${escapeHtml(type)}">${renderContent(node.content)}</div>`;
    }
    case "math":
    case "mathNode": {
      const latex = (node.attrs?.latex as string) || (node.attrs?.content as string) || "";
      return `<span class="katex-math" data-latex="${escapeHtml(latex)}">${escapeHtml(latex)}</span>`;
    }
    case "columnGroup":
      return `<div class="column-group" data-type="column-group">${node.content?.map(renderNode).join("") || ""}</div>`;
    case "column":
      return `<div class="column" data-type="column">${renderContent(node.content)}</div>`;
    case "customVideo":
    case "video": {
      const src = (node.attrs?.src as string) || "";
      return `<div class="video-wrapper"><video src="${escapeHtml(src)}" controls></video></div>`;
    }
    case "image": {
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
    }
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
  static renderTipTapToHtml = renderTipTapToHtml;
  static extractPlainTextFromTipTap = extractPlainTextFromTipTap;

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

      const cacheKey = includeAll ? "hierarchy:tree:full" : CacheService.keys.hierarchy();
      const cached = await CacheService.get<NavPage[]>(cacheKey);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
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

      // Asegura que los hijos estén ordenados por sortOrder en cada nivel
      const sortChildren = (nodes: NavPage[]): NavPage[] => {
        nodes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        nodes.forEach((n) => {
          if (n.children && n.children.length > 0) sortChildren(n.children);
        });
        return nodes;
      };

      sortChildren(rootNodes);

      // Save built tree to Redis cache for 1 hour
      await CacheService.set(cacheKey, rootNodes, 3600);

      return rootNodes;
    } catch (error) {
      console.warn("Prisma fetch failed, using mock data:", error);
      return this.getMockHierarchy();
    }
  }

  static async getPageBySlug(slug: string): Promise<PageContent | null> {
    try {
      const cacheKey = CacheService.keys.page(slug);
      const cached = await CacheService.get<PageContent>(cacheKey);
      if (cached) return cached;

      if (!process.env.DATABASE_URL) {
        return this.getMockPage(slug);
      }

      const page = await prisma.page.findUnique({
        where: { slug, status: "PUBLISHED" },
      });

      if (!page) return this.getMockPage(slug);

      const relData = await this.getRelationsAndResources(page.id);

      const result: PageContent = {
        id: page.id,
        title: page.title,
        slug: page.slug,
        contentJson: page.contentJson,
        excerpt: page.excerpt,
        path: page.path,
        parentId: page.parentId,
        status: page.status,
        relations: relData.relations,
        tags: relData.tags,
        resources: relData.resources,
      };

      await CacheService.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to fetch page ${slug}:`, error);
      return this.getMockPage(slug);
    }
  }

  /**
   * Fetches a single page by its nested slug path.
   * e.g., ["ciencias-naturales", "quimica", "quimica-organica"]
   */
  static async getPageByNestedSlugs(slugs: string[]): Promise<PageContent | null> {
    try {
      if (!slugs || slugs.length === 0) return null;

      const cacheKey = CacheService.keys.page(slugs.join("/"));
      const cached = await CacheService.get<PageContent>(cacheKey);
      if (cached) return cached;

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

      if (!process.env.DATABASE_URL) {
        return this.getMockPage(targetSlug) || this.getMockPage(normalizedTargetSlug);
      }

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

      if (!page) {
        return this.getMockPage(targetSlug) || this.getMockPage(normalizedTargetSlug);
      }

      const breadcrumbs = await this.getBreadcrumbs({ path: page.path, id: page.id });

      const normalizedBreadcrumbs = breadcrumbs.map(b => ({
        ...b,
        slug: normalizeSlug(b.slug),
      }));

      const relData = await this.getRelationsAndResources(page.id);

      const pageResult: PageContent = {
        id: page.id,
        title: page.title,
        slug: page.slug,
        contentJson: page.contentJson,
        excerpt: page.excerpt,
        path: page.path,
        parentId: page.parentId,
        status: page.status,
        relations: relData.relations,
        tags: relData.tags,
        resources: relData.resources,
      };

      if (normalizedBreadcrumbs.length !== normalizedSlugs.length) {
        if (normalizedBreadcrumbs.length > normalizedSlugs.length) {
          const lastBreadcrumb = normalizedBreadcrumbs[normalizedBreadcrumbs.length - 1];
          if (lastBreadcrumb.slug === normalizedSlugs[normalizedSlugs.length - 1]) {
            await CacheService.set(cacheKey, pageResult);
            return pageResult;
          }
        }
        return this.getMockPage(targetSlug) || this.getMockPage(normalizedTargetSlug);
      }

      for (let i = 0; i < normalizedSlugs.length; i++) {
        if (normalizedBreadcrumbs[i].slug !== normalizedSlugs[i]) {
          return this.getMockPage(targetSlug) || this.getMockPage(normalizedTargetSlug);
        }
      }

      await CacheService.set(cacheKey, pageResult);
      return pageResult;
    } catch (error) {
      console.warn(`Database query failed for [${slugs.join("/")}], falling back to mock data:`, error);
      const targetSlug = slugs[slugs.length - 1];
      const normalizeSlug = (slug: string): string => {
        return decodeURIComponent(slug)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
      };
      const normalizedTargetSlug = normalizeSlug(targetSlug);
      return this.getMockPage(targetSlug) || this.getMockPage(normalizedTargetSlug);
    }
  }

  /**
   * Returns breadcrumbs for a given page.
   */
  static async getBreadcrumbs(page: { path: string; id: string }): Promise<BreadcrumbItem[]> {
    try {
      const cacheKey = CacheService.keys.breadcrumbs(page.path || page.id);
      const cached = await CacheService.get<BreadcrumbItem[]>(cacheKey);
      if (cached) return cached;

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
          const res = [
            {
              title: pageData.title,
              slug: pageData.slug,
              href: buildPublicPageHref([pageData.slug]),
            },
          ];
          await CacheService.set(cacheKey, res);
          return res;
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

      const result = orderedBreadcrumbs.map((breadcrumb, index) => ({
        ...breadcrumb,
        href: buildPublicPageHref(
          orderedBreadcrumbs.slice(0, index + 1).map((item) => item.slug)
        ),
      }));

      await CacheService.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to fetch breadcrumbs for path ${page.path}:`, error);
      return [];
    }
  }

  private static getMockPage = getMockPage;
  private static getMockBreadcrumbs = getMockBreadcrumbs;

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
      console.error(`Failed to fetch page ${id}:`, error);
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

      // Generate a subtle custom ID
      const customId = generateSubtleId();

      let path = customId;
      let depth = 0;

      if (data.parentId) {
        const parent = await prisma.page.findUnique({
          where: { id: data.parentId },
          select: { path: true, depth: true },
        });

        if (parent) {
          depth = parent.depth + 1;
          path = parent.path ? `${parent.path}/${customId}` : customId;
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

      // Calcula SortOrder para que las páginas aparezcan al final
      const siblingMax = await prisma.page.aggregate({
        where: { parentId: data.parentId || null },
        _max: { sortOrder: true },
      });
      const nextSortOrder = (siblingMax._max.sortOrder ?? -1) + 1;

      const plainTextContent = extractPlainTextFromTipTap(data.contentJson);

      // Atomic single-query insertion with precomputed materialized path
      const page = await prisma.page.create({
        data: {
          id: customId,
          title: data.title,
          slug: uniqueSlug,
          parentId: data.parentId || null,
          path,
          depth,
          sortOrder: nextSortOrder,
          excerpt: data.excerpt,
          contentJson: toInputJsonValue(data.contentJson || { type: "doc", content: [] }),
          searchVector: plainTextContent,
          metaTitle: data.metaTitle || data.title,
          metaDescription: data.metaDescription || data.excerpt,
          status: "DRAFT",
        },
      });

      // Invalidate Redis hierarchy and page caches
      await CacheService.invalidatePageCaches(page.id, page.slug, page.path);

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
      console.error("Failed to create page:", error);
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

      const plainTextContent = extractPlainTextFromTipTap(contentJson);

      const page = await prisma.page.update({
        where: { id },
        data: {
          contentJson: toInputJsonValue(contentJson),
          searchVector: plainTextContent,
          excerpt: excerpt || undefined,
          updatedAt: new Date(),
        },
      });

      await CacheService.invalidatePageCaches(page.id, page.slug, page.path);

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
      console.error(`Failed to update page ${id}:`, error);
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

      await CacheService.invalidatePageCaches(page.id, page.slug, page.path);

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
      console.error(`Failed to publish page ${id}:`, error);
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

      await CacheService.invalidatePageCaches(page.id, page.slug, page.path);

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
      console.error(`Failed to update page metadata ${id}:`, error);
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

      await CacheService.invalidatePageCaches(id);
      await CacheService.delPattern("page:slug:*");
      await CacheService.delPattern("breadcrumbs:path:*");

      return true;
    } catch (error) {
      console.error(`Failed to delete page ${id}:`, error);
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

      const res = await prisma.$transaction(async (tx) => {
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

      if (res) {
        await CacheService.del(CacheService.keys.hierarchy());
        await CacheService.delPattern("page:slug:*");
        await CacheService.delPattern("breadcrumbs:path:*");
      }

      return res;
    } catch (error) {
      console.error(`Failed to update page hierarchy ${id}:`, error);
      return null;
    }
  }

  // ======================================================
  // PAGE RELATIONS & RESOURCES METHODS
  // ======================================================

  /**
   * Fetches all relations, tags, and resources for a given page ID
   */
  static async getRelationsAndResources(pageId: string, includeUnpublished = false) {
    try {
      const cacheKey = CacheService.keys.relations(pageId);
      if (!includeUnpublished) {
        const cached = await CacheService.get<{
          relations: { id: string; title: string; slug: string; type: string; relationId: string }[];
          tags: string[];
          resources: { id: string; title: string; url: string; type: ResourceType; description: string | null }[];
        }>(cacheKey);
        if (cached) return cached;
      }

      if (!process.env.DATABASE_URL) {
        return { relations: [], tags: [], resources: [] };
      }

      const publishedPageFilter = includeUnpublished
        ? {}
        : { page: { status: "PUBLISHED" as const } };

      const [relations, pageTags, resources] = await Promise.all([
        prisma.pageRelation.findMany({
          where: {
            sourceId: pageId,
            ...(includeUnpublished
              ? {}
              : {
                source: { status: "PUBLISHED" },
                target: { status: "PUBLISHED" },
              }),
          },
          include: {
            target: {
              select: {
                id: true,
                title: true,
                slug: true,
                path: true,
              },
            },
          },
        }),
        prisma.pageTag.findMany({
          where: { pageId, ...publishedPageFilter },
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        }),
        prisma.pageResource.findMany({
          where: { pageId, ...publishedPageFilter },
          select: {
            id: true,
            title: true,
            url: true,
            type: true,
            description: true,
          },
        }),
      ]);

      const mappedRelations = await Promise.all(
        relations.map(async (r) => {
          const crumbs = await this.getBreadcrumbs({ path: r.target.path, id: r.target.id });
          const fullHref =
            crumbs.length > 0
              ? crumbs[crumbs.length - 1].href
              : buildPublicPageHref([r.target.slug]);

          return {
            id: r.target.id,
            title: r.target.title,
            slug: r.target.slug,
            type: r.type,
            relationId: r.id,
            href: fullHref,
          };
        })
      );

      const result = {
        relations: mappedRelations,
        tags: pageTags.map((pt) => pt.tag.name),
        resources,
      };

      if (!includeUnpublished) {
        await CacheService.set(cacheKey, result, RELATIONS_TTL);
      }
      return result;
    } catch (error) {
      console.error(`Failed to fetch relations & resources for page ${pageId}:`, error);
      return { relations: [], tags: [], resources: [] };
    }
  }

  /**
   * Creates or updates a relationship between two pages
   */
  static async addPageRelation(
    sourceId: string,
    targetId: string,
    type: RelationType = "RELATED"
  ) {
    try {
      if (!process.env.DATABASE_URL) throw new Error("Database not configured");

      // Strict String Primitive Validation to prevent Prisma Object Query Injection
      const cleanSourceId = typeof sourceId === "string" ? sourceId.trim() : String(sourceId || "").trim();
      const cleanTargetId = typeof targetId === "string" ? targetId.trim() : String(targetId || "").trim();
      const validTypes: RelationType[] = ["PREREQUISITE", "NEXT_STEP", "RELATED"];
      const cleanType: RelationType = validTypes.includes(type) ? type : "RELATED";

      if (!cleanSourceId || !cleanTargetId || cleanSourceId === cleanTargetId) {
        throw new Error("A page cannot be related to itself or invalid target.");
      }

      const relation = await prisma.pageRelation.upsert({
        where: {
          sourceId_targetId_type: {
            sourceId: cleanSourceId,
            targetId: cleanTargetId,
            type: cleanType,
          },
        },
        create: {
          sourceId: cleanSourceId,
          targetId: cleanTargetId,
          type: cleanType,
        },
        update: {},
      });

      await CacheService.invalidatePageCaches(cleanSourceId);
      await CacheService.invalidatePageCaches(cleanTargetId);

      return relation;
    } catch (error) {
      console.error("Failed to add page relation:", error);
      return null;
    }
  }

  /**
   * Removes a relationship between two pages
   */
  static async removePageRelation(sourceId: string, targetId: string, type: RelationType) {
    try {
      if (!process.env.DATABASE_URL) throw new Error("Database not configured");

      // Strict Primitive Sanitization against Object Query Injection (Aikido Security Audit)
      const cleanSourceId = typeof sourceId === "string" ? sourceId.trim() : String(sourceId || "").trim();
      const cleanTargetId = typeof targetId === "string" ? targetId.trim() : String(targetId || "").trim();
      const validTypes: RelationType[] = ["PREREQUISITE", "NEXT_STEP", "RELATED"];

      if (!cleanSourceId || !cleanTargetId || !validTypes.includes(type)) {
        return false;
      }

      await prisma.pageRelation.deleteMany({
        where: {
          sourceId: cleanSourceId,
          targetId: cleanTargetId,
          type: type,
        },
      });

      await CacheService.invalidatePageCaches(cleanSourceId);
      await CacheService.invalidatePageCaches(cleanTargetId);

      return true;
    } catch (error) {
      console.error("Failed to remove page relation:", error);
      return false;
    }
  }

  /**
   * Adds a tag to a page (creates tag if it does not exist)
   */
  static async addPageTag(pageId: string, tagName: string) {
    try {
      if (!process.env.DATABASE_URL) throw new Error("Database not configured");

      const cleanPageId = typeof pageId === "string" ? pageId.trim() : String(pageId || "").trim();
      const cleanName = typeof tagName === "string" ? tagName.trim() : String(tagName || "").trim();
      if (!cleanPageId || !cleanName) return null;

      const slug = cleanName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

      const tag = await prisma.tag.upsert({
        where: { slug },
        create: { name: cleanName, slug },
        update: {},
      });

      await prisma.pageTag.upsert({
        where: {
          pageId_tagId: {
            pageId: cleanPageId,
            tagId: tag.id,
          },
        },
        create: { pageId: cleanPageId, tagId: tag.id },
        update: {},
      });

      await CacheService.invalidatePageCaches(cleanPageId);

      return tag;
    } catch (error) {
      console.error("Failed to add page tag:", error);
      return null;
    }
  }

  /**
   * Removes a tag from a page
   */
  static async removePageTag(pageId: string, tagName: string) {
    try {
      if (!process.env.DATABASE_URL) throw new Error("Database not configured");

      const cleanPageId = typeof pageId === "string" ? pageId.trim() : String(pageId || "").trim();
      const cleanTagName = typeof tagName === "string" ? tagName.trim() : String(tagName || "").trim();
      if (!cleanPageId || !cleanTagName) return false;

      const slug = cleanTagName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

      const tag = await prisma.tag.findUnique({ where: { slug } });
      if (!tag) return false;

      await prisma.pageTag.deleteMany({
        where: { pageId: cleanPageId, tagId: tag.id },
      });

      await CacheService.invalidatePageCaches(cleanPageId);

      return true;
    } catch (error) {
      console.error("Failed to remove page tag:", error);
      return false;
    }
  }

  /**
   * Adds an external resource to a page
   */
  static async addPageResource(
    pageId: string,
    data: { title: string; url: string; type: ResourceType; description?: string }
  ) {
    try {
      if (!process.env.DATABASE_URL) throw new Error("Database not configured");

      const cleanPageId = typeof pageId === "string" ? pageId.trim() : String(pageId || "").trim();
      if (!cleanPageId) return null;

      const resource = await prisma.pageResource.create({
        data: {
          pageId: cleanPageId,
          title: data.title,
          url: data.url,
          type: data.type,
          description: data.description,
        },
      });

      await CacheService.invalidatePageCaches(cleanPageId);

      return resource;
    } catch (error) {
      console.error("Failed to add page resource:", error);
      return null;
    }
  }

  /**
   * Removes an external resource from a page
   */
  static async removePageResource(resourceId: string) {
    try {
      if (!process.env.DATABASE_URL) throw new Error("Database not configured");

      const cleanResourceId = typeof resourceId === "string" ? resourceId.trim() : String(resourceId || "").trim();
      if (!cleanResourceId) return false;

      const resource = await prisma.pageResource.findUnique({
        where: { id: cleanResourceId },
        select: { pageId: true },
      });

      await prisma.pageResource.delete({
        where: { id: cleanResourceId },
      });

      if (resource?.pageId) {
        await CacheService.invalidatePageCaches(resource.pageId);
      }

      return true;
    } catch (error) {
      console.error("Failed to remove page resource:", error);
      return false;
    }
  }

  /**
   * Searches pages for relation autocompletion
   */
  static async searchPagesForRelating(query: string, excludePageId?: string) {
    try {
      if (!process.env.DATABASE_URL) return [];

      const cleanQuery = query.trim();
      if (!cleanQuery) return [];

      const pages = await prisma.page.findMany({
        where: {
          id: excludePageId ? { not: excludePageId } : undefined,
          OR: [
            { title: { contains: cleanQuery, mode: "insensitive" } },
            { slug: { contains: cleanQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
        take: 8,
      });

      return pages;
    } catch (error) {
      console.error("Failed to search pages for relating:", error);
      return [];
    }
  }

  private static getMockHierarchy = getMockHierarchy;
}
