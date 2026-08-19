import prisma from "@/lib/prisma";
import { Prisma, RelationType, ResourceType } from "@prisma/client";
import { buildPublicPageHref } from "@/lib/page-paths";
import { NavPage } from "@/types";
import { CacheService, RELATIONS_TTL } from "./cache-service";

import crypto from "crypto";

/**
 * Generates a clean, collision-resistant ID (e.g., "e8f3a9b2c1d4")
 * Eliminates database roundtrips and handles scaling to millions of pages with 0 latency.
 */
function generateSubtleId(): string {
  return crypto.randomBytes(6).toString("hex");
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
  relations?: { id: string; title: string; slug: string; type: string }[];
  tags?: string[];
  resources?: { title: string; url: string; type: string; description?: string | null }[];
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
        return null;
      }

      for (let i = 0; i < normalizedSlugs.length; i++) {
        if (normalizedBreadcrumbs[i].slug !== normalizedSlugs[i]) {
          return null;
        }
      }

      await CacheService.set(cacheKey, pageResult);
      return pageResult;
    } catch (error) {
      console.error(`Failed to fetch page by nested slugs [${slugs.join("/")}]:`, error);
      return null;
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

  private static getMockPage(slug: string): PageContent | null {
    const mockData: Record<string, PageContent> = {
      "introduccion": {
        id: "intro-1",
        title: "1. Bienvenido a la Cartografía del Conocimiento",
        slug: "introduccion",
        excerpt: "Una guía interactiva sobre cómo navegar por el repositorio jerárquico de LambdaIDX.",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Bienvenido a la Cartografía del Conocimiento" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "LambdaIDX es un archivo de conocimiento de próxima generación diseñado para estructurar y conectar las disciplinas científicas e investigativas.",
                },
              ],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "¿Cómo explorar este repositorio?" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "A diferencia de las wikis planas tradicionales, LambdaIDX organiza la información como un árbol multinivel interactivo:",
                },
              ],
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "Barra Lateral Izquierda: " },
                        { type: "text", text: "Navega y despliega ramas de conceptos con un solo clic." },
                      ],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "Panel Lateral Derecho: " },
                        { type: "text", text: "Descubre las relaciones de temas (Prerrequisitos y Siguientes Pasos) en tiempo real." },
                      ],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "Navegación Fluida: " },
                        { type: "text", text: "Transiciones ultra-rápidas optimizadas para la lectura continua." },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        path: "intro-1",
        parentId: null,
        status: "PUBLISHED",
        relations: [
          { id: "intro-2", title: "2. Relaciones entre Temas y Grafos", slug: "relaciones-y-grafos", type: "NEXT_STEP" },
          { id: "science-root", title: "Las Ciencias Conocidas", slug: "las-ciencias-conocidas", type: "RELATED" },
        ],
        tags: ["Cartografia", "Guia", "Introduccion"],
        resources: [
          { title: "MDN Web Docs - Estructuras de Documentación", url: "https://developer.mozilla.org/es/docs/MDN/Community", type: "ARTICLE", description: "Estándar de documentación jerárquica" },
        ],
      },
      "relaciones-y-grafos": {
        id: "intro-2",
        title: "2. Relaciones entre Temas y Grafos",
        slug: "relaciones-y-grafos",
        excerpt: "Descubre cómo interconectar conceptos mediante Prerrequisitos, Siguientes Pasos y Recursos.",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Relaciones entre Temas y Grafos" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "En LambdaIDX, los temas no existen aislados. Cada concepto se vincula con otros nodos del sistema formando una red rica de aprendizaje.",
                },
              ],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Tipos de Relaciones" }],
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "Prerrequisitos: " },
                        { type: "text", text: "Lecturas recomendadas antes de abordar el tema actual." },
                      ],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "Siguiente Paso: " },
                        { type: "text", text: "Contenidos avanzados para continuar la secuencia de investigación." },
                      ],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "Recursos Externos: " },
                        { type: "text", text: "Artículos, documentación oficial y herramientas complementarias." },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        path: "intro-1/intro-2",
        parentId: "intro-1",
        status: "PUBLISHED",
        relations: [
          { id: "intro-1", title: "1. Bienvenido a la Cartografía del Conocimiento", slug: "introduccion", type: "PREREQUISITE" },
          { id: "intro-3", title: "3. Búsqueda Instantánea y Herramientas", slug: "busqueda-y-herramientas", type: "NEXT_STEP" },
        ],
        tags: ["Relaciones", "Grafos", "Conexiones"],
        resources: [
          { title: "Documentación Oficial de Prisma ORM", url: "https://www.prisma.io/docs", type: "TOOL", description: "Ejemplo de relaciones relacionales" },
        ],
      },
      "busqueda-y-herramientas": {
        id: "intro-3",
        title: "3. Búsqueda Instantánea y Herramientas",
        slug: "busqueda-y-herramientas",
        excerpt: "Maximiza tu eficiencia de investigación con atajos de teclado y el buscador en tiempo real.",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Búsqueda Instantánea y Herramientas de Lectura" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Diseñado para garantizar la máxima concentración durante tus sesiones de investigación.",
                },
              ],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Atajos Principales" }],
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "Búsqueda Rápida (Cmd+K / Ctrl+K): " },
                        { type: "text", text: "Encuentra cualquier tema o subtema de inmediato." },
                      ],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", marks: [{ type: "bold" }], text: "Etiquetas (#Tags): " },
                        { type: "text", text: "Filtrado transversal por conceptos comunes." },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        path: "intro-1/intro-3",
        parentId: "intro-1",
        status: "PUBLISHED",
        relations: [
          { id: "intro-2", title: "2. Relaciones entre Temas y Grafos", slug: "relaciones-y-grafos", type: "PREREQUISITE" },
          { id: "science-root", title: "Las Ciencias Conocidas", slug: "las-ciencias-conocidas", type: "NEXT_STEP" },
        ],
        tags: ["Busqueda", "Atajos", "Productividad"],
        resources: [],
      },
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
      "introduccion-al-archivo": {
        id: "mock-1-1",
        title: "Introducción al Archivo",
        slug: "introduccion-al-archivo",
        contentJson: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "LambdaIDX organiza el conocimiento científico en estructuras multinivel de alta densidad." }] },
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Profundidad Jerárquica" }] },
            { type: "paragraph", content: [{ type: "text", text: "A diferencia de los sistemas tradicionales, cada tema se ubica en su contexto exacto dentro del árbol del conocimiento." }] }
          ]
        },
        path: "intro-1/introduccion-al-archivo",
        parentId: "intro-1",
        status: "PUBLISHED",
      },
      "metodologia-de-estudio": {
        id: "mock-2",
        title: "Metodología de Estudio",
        slug: "metodologia-de-estudio",
        contentJson: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Recomendaciones para maximizar la retención utilizando el mapa relacional de LambdaIDX." }] },
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Secuencia Lógica" }] },
            { type: "paragraph", content: [{ type: "text", text: "Revisa siempre las lecturas previas en la sección de Prerrequisitos antes de avanzar a conceptos de mayor complejidad." }] }
          ]
        },
        path: "metodologia-de-estudio",
        parentId: null,
        status: "PUBLISHED",
      },
      "recursos-complementarios": {
        id: "mock-2-1",
        title: "Recursos Complementarios",
        slug: "recursos-complementarios",
        contentJson: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: "Fuentes científicas y documentación externa verificada por la comunidad." }] }
          ]
        },
        path: "metodologia-de-estudio/recursos-complementarios",
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
    status?: string;
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
      const customId = generateSubtleId();

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
          status: (data.status as "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED") || "PUBLISHED",
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

      const page = await prisma.page.update({
        where: { id },
        data: {
          contentJson: toInputJsonValue(contentJson),
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
  static async getRelationsAndResources(pageId: string) {
    try {
      const cacheKey = CacheService.keys.relations(pageId);
      const cached = await CacheService.get<{
        relations: { id: string; title: string; slug: string; type: string; relationId: string }[];
        tags: string[];
        resources: { id: string; title: string; url: string; type: ResourceType; description: string | null }[];
      }>(cacheKey);
      if (cached) return cached;

      if (!process.env.DATABASE_URL) {
        return { relations: [], tags: [], resources: [] };
      }

      const [relations, pageTags, resources] = await Promise.all([
        prisma.pageRelation.findMany({
          where: { sourceId: pageId },
          include: {
            target: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        }),
        prisma.pageTag.findMany({
          where: { pageId },
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
          where: { pageId },
          select: {
            id: true,
            title: true,
            url: true,
            type: true,
            description: true,
          },
        }),
      ]);

      const result = {
        relations: relations.map((r) => ({
          id: r.target.id,
          title: r.target.title,
          slug: r.target.slug,
          type: r.type,
          relationId: r.id,
        })),
        tags: pageTags.map((pt) => pt.tag.name),
        resources,
      };

      await CacheService.set(cacheKey, result, RELATIONS_TTL);
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

  private static getMockHierarchy(): NavPage[] {
    return [
      {
        id: "intro-1",
        title: "1. Bienvenido a la Cartografía del Conocimiento",
        slug: "introduccion",
        parentId: null,
        path: "intro-1",
        depth: 0,
        sortOrder: -1,
        status: "PUBLISHED",
        children: [
          {
            id: "intro-2",
            title: "2. Relaciones entre Temas y Grafos",
            slug: "relaciones-y-grafos",
            parentId: "intro-1",
            path: "intro-1/intro-2",
            depth: 1,
            sortOrder: 0,
            status: "PUBLISHED",
            children: [],
          },
          {
            id: "intro-3",
            title: "3. Búsqueda Instantánea y Herramientas",
            slug: "busqueda-y-herramientas",
            parentId: "intro-1",
            path: "intro-1/intro-3",
            depth: 1,
            sortOrder: 1,
            status: "PUBLISHED",
            children: [],
          },
        ],
      },
      {
        id: "science-root",
        title: "Las Ciencias Conocidas",
        slug: "las-ciencias-conocidas",
        parentId: null,
        path: "science-root",
        depth: 0,
        sortOrder: 0,
        status: "PUBLISHED",
        children: [],
      },
      {
        id: "mock-1",
        title: "Introduction",
        slug: "introduction",
        parentId: null,
        path: "mock-1",
        depth: 0,
        sortOrder: 1,
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
        title: "Metodología de Estudio",
        slug: "metodologia-de-estudio",
        parentId: null,
        path: "metodologia-de-estudio",
        depth: 0,
        sortOrder: 1,
        status: 'PUBLISHED',
        children: [
          {
            id: "mock-2-1",
            title: "Recursos Complementarios",
            slug: "recursos-complementarios",
            parentId: "mock-2",
            path: "metodologia-de-estudio/recursos-complementarios",
            depth: 1,
            sortOrder: 0,
            status: 'PUBLISHED',
            children: [],
          },
        ],
      },
    ];
  }
}
