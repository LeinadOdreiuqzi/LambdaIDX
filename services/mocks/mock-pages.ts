import { PageContent, BreadcrumbItem, NavPage } from "@/types";
import { buildPublicPageHref } from "@/lib/page-paths";

/**
 * Fallback static mock pages for offline development, seeding preview, or DB failure gracefully.
 */
export function getMockPage(slug: string): PageContent | null {
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
        { id: "intro-2", title: "2. Relaciones entre Temas y Grafos", slug: "relaciones-y-grafos", href: "/index/introduccion/relaciones-y-grafos", type: "NEXT_STEP" },
        { id: "mock-2", title: "Metodología de Estudio", slug: "metodologia-de-estudio", href: "/index/metodologia-de-estudio", type: "RELATED" },
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
        { id: "intro-1", title: "1. Bienvenido a la Cartografía del Conocimiento", slug: "introduccion", href: "/index/introduccion", type: "PREREQUISITE" },
        { id: "intro-3", title: "3. Búsqueda Instantánea y Herramientas", slug: "busqueda-y-herramientas", href: "/index/introduccion/busqueda-y-herramientas", type: "NEXT_STEP" },
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
        { id: "intro-2", title: "2. Relaciones entre Temas y Grafos", slug: "relaciones-y-grafos", href: "/index/introduccion/relaciones-y-grafos", type: "PREREQUISITE" },
        { id: "mock-2", title: "Metodología de Estudio", slug: "metodologia-de-estudio", href: "/index/metodologia-de-estudio", type: "NEXT_STEP" },
        { id: "mock-2-1", title: "Recursos Complementarios", slug: "recursos-complementarios", href: "/index/metodologia-de-estudio/recursos-complementarios", type: "RELATED" },
        { id: "mock-1-1", title: "Introducción al Archivo", slug: "introduccion-al-archivo", href: "/index/introduccion/introduccion-al-archivo", type: "REFERENCE" },
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
      relations: [
        { id: "intro-1", title: "1. Bienvenido a la Cartografía del Conocimiento", slug: "introduccion", href: "/index/introduccion", type: "PREREQUISITE" },
        { id: "mock-2", title: "Metodología de Estudio", slug: "metodologia-de-estudio", href: "/index/metodologia-de-estudio", type: "NEXT_STEP" },
      ],
      tags: ["Archivo", "Estructura", "Jerarquia"],
      resources: [],
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
      relations: [
        { id: "intro-3", title: "3. Búsqueda Instantánea y Herramientas", slug: "busqueda-y-herramientas", href: "/index/introduccion/busqueda-y-herramientas", type: "PREREQUISITE" },
        { id: "mock-2-1", title: "Recursos Complementarios", slug: "recursos-complementarios", href: "/index/metodologia-de-estudio/recursos-complementarios", type: "NEXT_STEP" },
      ],
      tags: ["Metodologia", "Estudio", "Optimizacion"],
      resources: [
        { title: "Técnicas de Aprendizaje Estructurado", url: "https://es.wikipedia.org/wiki/Metodolog%C3%ADa_de_estudio", type: "ARTICLE", description: "Guía de referencia" },
      ],
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
      relations: [
        { id: "mock-2", title: "Metodología de Estudio", slug: "metodologia-de-estudio", href: "/index/metodologia-de-estudio", type: "PREREQUISITE" },
        { id: "intro-1", title: "1. Bienvenido a la Cartografía del Conocimiento", slug: "introduccion", href: "/index/introduccion", type: "RELATED" },
      ],
      tags: ["Recursos", "Referencias", "Documentacion"],
      resources: [
        { title: "Archivo Abierto de Conocimiento", url: "https://archive.org", type: "TOOL", description: "Repositorio universal" },
      ],
    },
  };
  return mockData[slug] || null;
}

/**
 * Fallback static breadcrumb generator for mock paths.
 */
export function getMockBreadcrumbs(path: string): BreadcrumbItem[] {
  if (!path) return [];
  const mapIdToBreadcrumb: Record<string, { title: string; slug: string }> = {
    "intro-1": { title: "1. Bienvenido a la Cartografía", slug: "introduccion" },
    "intro-2": { title: "2. Relaciones entre Temas y Grafos", slug: "relaciones-y-grafos" },
    "intro-3": { title: "3. Búsqueda Instantánea y Herramientas", slug: "busqueda-y-herramientas" },
    "introduccion-al-archivo": { title: "Introducción al Archivo", slug: "introduccion-al-archivo" },
    "mock-1": { title: "Introduction", slug: "introduction" },
    "mock-1-1": { title: "What is LambdaIDX?", slug: "what-is-lambdaidx" },
    "mock-2": { title: "Metodología de Estudio", slug: "metodologia-de-estudio" },
    "metodologia-de-estudio": { title: "Metodología de Estudio", slug: "metodologia-de-estudio" },
    "recursos-complementarios": { title: "Recursos Complementarios", slug: "recursos-complementarios" },
    "mock-2-1": { title: "Recursos Complementarios", slug: "recursos-complementarios" },
  };

  const segments = path.split('/');
  const breadcrumbs = segments.map((seg) => {
    if (mapIdToBreadcrumb[seg]) {
      return mapIdToBreadcrumb[seg];
    }
    return {
      title: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      slug: seg,
    };
  });

  return breadcrumbs.map((breadcrumb, index) => ({
    ...breadcrumb,
    href: buildPublicPageHref(
      breadcrumbs.slice(0, index + 1).map((item) => item.slug)
    ),
  }));
}

/**
 * Fallback static navigation hierarchy when DB is unreachable or empty.
 */
export function getMockHierarchy(): NavPage[] {
  return [
    {
      id: "intro-1",
      title: "1. Bienvenido a la Cartografía del Conocimiento",
      slug: "introduccion",
      parentId: null,
      path: "intro-1",
      depth: 0,
      sortOrder: 0,
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
        {
          id: "mock-1-1",
          title: "Introducción al Archivo",
          slug: "introduccion-al-archivo",
          parentId: "intro-1",
          path: "intro-1/introduccion-al-archivo",
          depth: 1,
          sortOrder: 2,
          status: "PUBLISHED",
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
      status: "PUBLISHED",
      children: [
        {
          id: "mock-2-1",
          title: "Recursos Complementarios",
          slug: "recursos-complementarios",
          parentId: "mock-2",
          path: "metodologia-de-estudio/recursos-complementarios",
          depth: 1,
          sortOrder: 0,
          status: "PUBLISHED",
          children: [],
        },
      ],
    },
  ];
}
