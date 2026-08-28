import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Seed data: Hierarchical structure for knowledge base
 * Example: Sciences → Physics → Topics → Subtopics
 */
export async function seedHierarchicalContent() {
  try {
    // Clear existing data
    await prisma.page.deleteMany({});

    console.log("Seeding hierarchical content...");

    // ═══════════════════════════════════════════════════════════════
    // ROOT: Las Ciencias Conocidas
    // ═══════════════════════════════════════════════════════════════
    const rootScience = await prisma.page.create({
      data: {
        id: "science-root",
        title: "Las Ciencias Conocidas",
        slug: "las-ciencias-conocidas",
        path: "science-root",
        depth: 0,
        sortOrder: 0,
        excerpt: "Exploración integral de las disciplinas científicas fundamentales",
        metaTitle: "Las Ciencias Conocidas - LambdaIDX",
        metaDescription: "Navegación jerárquica de todas las disciplinas científicas conocidas",
        status: "PUBLISHED",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Las Ciencias Conocidas" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Una exploración sistemática y jerárquica de todas las disciplinas científicas que conforman nuestro entendimiento del universo.",
                },
              ],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Disciplinas Principales" }],
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
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "Física",
                        },
                        {
                          type: "text",
                          text: " - Estudio de la materia y energía",
                        },
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
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "Química",
                        },
                        {
                          type: "text",
                          text: " - Estudio de sustancias y reacciones",
                        },
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
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "Biología",
                        },
                        {
                          type: "text",
                          text: " - Estudio de organismos vivos",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        } as Prisma.InputJsonValue,
      },
    });

    // ═══════════════════════════════════════════════════════════════
    // PHYSICS - Nivel 1
    // ═══════════════════════════════════════════════════════════════
    const physics = await prisma.page.create({
      data: {
        id: "physics",
        title: "Física",
        slug: "fisica",
        path: "science-root/physics",
        parentId: "science-root",
        depth: 1,
        sortOrder: 0,
        excerpt: "Disciplina que estudia la materia, energía y sus interacciones",
        metaTitle: "Física - Ciencias Naturales",
        metaDescription: "Introducción a los conceptos fundamentales de la física",
        status: "PUBLISHED",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Física" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "La física es la ciencia natural que estudia los componentes fundamentales del universo, sus interacciones y los comportamientos que resultan de estas interacciones.",
                },
              ],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Áreas Principales" }],
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
                        { type: "text", text: "Mecánica Clásica" },
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
                        { type: "text", text: "Termodinámica" },
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
                        { type: "text", text: "Electromagnetismo" },
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
                        { type: "text", text: "Mecánica Cuántica" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        } as Prisma.InputJsonValue,
      },
    });

    // ═══════════════════════════════════════════════════════════════
    // PHYSICS SUBTOPICS - Nivel 2
    // ═══════════════════════════════════════════════════════════════

    // Mechanics
    const mechanics = await prisma.page.create({
      data: {
        id: "mechanics",
        title: "Mecánica Clásica",
        slug: "mecanica-clasica",
        path: "science-root/physics/mechanics",
        parentId: "physics",
        depth: 2,
        sortOrder: 0,
        excerpt:
          "Estudio del movimiento y las fuerzas en sistemas macroscópicos",
        metaTitle: "Mecánica Clásica - Física",
        metaDescription:
          "Introducción a las leyes de Newton y la dinámica clásica",
        status: "PUBLISHED",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Mecánica Clásica" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "La mecánica clásica describe el movimiento de objetos macroscópicos bajo la influencia de fuerzas.",
                },
              ],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Temas Fundamentales" }],
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
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "Cinemática",
                        },
                        {
                          type: "text",
                          text: " - Descripción del movimiento",
                        },
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
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "Dinámica",
                        },
                        {
                          type: "text",
                          text: " - Estudio de las fuerzas",
                        },
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
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "Leyes de Newton",
                        },
                        {
                          type: "text",
                          text: " - Fundamentos del movimiento",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        } as Prisma.InputJsonValue,
      },
    });

    // Thermodynamics
    const thermodynamics = await prisma.page.create({
      data: {
        id: "thermodynamics",
        title: "Termodinámica",
        slug: "termodinamica",
        path: "science-root/physics/thermodynamics",
        parentId: "physics",
        depth: 2,
        sortOrder: 1,
        excerpt: "Estudio del calor, temperatura y energía",
        metaTitle: "Termodinámica - Física",
        metaDescription: "Leyes de la termodinámica y transferencia de energía",
        status: "PUBLISHED",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Termodinámica" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "La termodinámica estudia el calor, la temperatura y los procesos energéticos en sistemas físicos.",
                },
              ],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Leyes Fundamentales" }],
            },
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Ley Cero" }],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Primera Ley" }],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Segunda Ley" }],
                    },
                  ],
                },
                {
                  type: "listItem",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Tercera Ley" }],
                    },
                  ],
                },
              ],
            },
          ],
        } as Prisma.InputJsonValue,
      },
    });

    // Quantum Mechanics
    const quantum = await prisma.page.create({
      data: {
        id: "quantum",
        title: "Mecánica Cuántica",
        slug: "mecanica-cuantica",
        path: "science-root/physics/quantum",
        parentId: "physics",
        depth: 2,
        sortOrder: 2,
        excerpt: "Teoría del comportamiento de partículas subatómicas",
        metaTitle: "Mecánica Cuántica - Física",
        metaDescription:
          "Introducción a la mecánica cuántica y dualidad onda-partícula",
        status: "PUBLISHED",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Mecánica Cuántica" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "La mecánica cuántica describe el comportamiento de la materia y la energía a escala atómica y subatómica.",
                },
              ],
            },
          ],
        } as Prisma.InputJsonValue,
      },
    });

    // ═══════════════════════════════════════════════════════════════
    // MECHANICS SUBTOPICS - Nivel 3
    // ═══════════════════════════════════════════════════════════════

    const kinematics = await prisma.page.create({
      data: {
        id: "kinematics",
        title: "Cinemática",
        slug: "cinematica",
        path: "science-root/physics/mechanics/kinematics",
        parentId: "mechanics",
        depth: 3,
        sortOrder: 0,
        excerpt: "Descripción matemática del movimiento sin considerar fuerzas",
        metaTitle: "Cinemática - Mecánica",
        metaDescription: "Conceptos de posición, velocidad y aceleración",
        status: "PUBLISHED",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Cinemática" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "La cinemática es la rama de la mecánica que describe el movimiento de los cuerpos sin considerar las fuerzas que los producen.",
                },
              ],
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Conceptos Clave" }],
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
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "Posición",
                        },
                        {
                          type: "text",
                          text: " - Ubicación en el espacio",
                        },
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
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "Velocidad",
                        },
                        {
                          type: "text",
                          text: " - Razón de cambio de posición",
                        },
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
                        {
                          type: "text",
                          marks: [{ type: "bold" }],
                          text: "Aceleración",
                        },
                        {
                          type: "text",
                          text: " - Razón de cambio de velocidad",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        } as Prisma.InputJsonValue,
      },
    });

    const dynamics = await prisma.page.create({
      data: {
        id: "dynamics",
        title: "Dinámica",
        slug: "dinamica",
        path: "science-root/physics/mechanics/dynamics",
        parentId: "mechanics",
        depth: 3,
        sortOrder: 1,
        excerpt: "Estudio de las fuerzas y sus efectos en el movimiento",
        metaTitle: "Dinámica - Mecánica",
        metaDescription: "Leyes de Newton y ecuaciones de movimiento",
        status: "PUBLISHED",
        contentJson: {
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Dinámica" }],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "La dinámica estudia las fuerzas y cómo afectan el movimiento de los cuerpos.",
                },
              ],
            },
          ],
        } as Prisma.InputJsonValue,
      },
    });

    // ═══════════════════════════════════════════════════════════════
    // INTRODUCCIÓN GUIADA (Cartografía del Conocimiento)
    // ═══════════════════════════════════════════════════════════════
    const intro1 = await prisma.page.create({
      data: {
        id: "intro-1",
        title: "1. Bienvenido a la Cartografía del Conocimiento",
        slug: "introduccion",
        path: "intro-1",
        depth: 0,
        sortOrder: -1,
        excerpt: "Una guía interactiva sobre cómo navegar por el repositorio jerárquico de LambdaIDX.",
        metaTitle: "1. Bienvenido a la Cartografía - LambdaIDX",
        metaDescription: "Aprende a navegar por la estructura jerárquica de LambdaIDX.",
        status: "PUBLISHED",
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
        } as Prisma.InputJsonValue,
      },
    });

    const intro2 = await prisma.page.create({
      data: {
        id: "intro-2",
        title: "2. Relaciones entre Temas y Grafos",
        slug: "relaciones-y-grafos",
        path: "intro-1/intro-2",
        parentId: "intro-1",
        depth: 1,
        sortOrder: 0,
        excerpt: "Descubre cómo interconectar conceptos mediante Prerrequisitos, Siguientes Pasos y Recursos.",
        metaTitle: "2. Relaciones y Grafos - LambdaIDX",
        metaDescription: "Conexión de conceptos en el panel lateral de Topic Relationships.",
        status: "PUBLISHED",
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
        } as Prisma.InputJsonValue,
      },
    });

    const intro3 = await prisma.page.create({
      data: {
        id: "intro-3",
        title: "3. Búsqueda Instantánea y Herramientas",
        slug: "busqueda-y-herramientas",
        path: "intro-1/intro-3",
        parentId: "intro-1",
        depth: 1,
        sortOrder: 1,
        excerpt: "Maximiza tu eficiencia de investigación con atajos de teclado y el buscador en tiempo real.",
        metaTitle: "3. Búsqueda e Herramientas - LambdaIDX",
        metaDescription: "Atajos de teclado y búsqueda instantánea para alta densidad de investigación.",
        status: "PUBLISHED",
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
        } as Prisma.InputJsonValue,
      },
    });

    // ═══════════════════════════════════════════════════════════════
    // RELACIONES & RECURSOS INTRODUCTORIOS
    // ═══════════════════════════════════════════════════════════════
    await prisma.pageRelation.createMany({
      data: [
        { sourceId: "intro-1", targetId: "intro-2", type: "NEXT_STEP" },
        { sourceId: "intro-2", targetId: "intro-1", type: "PREREQUISITE" },
        { sourceId: "intro-2", targetId: "intro-3", type: "NEXT_STEP" },
        { sourceId: "intro-3", targetId: "intro-2", type: "PREREQUISITE" },
      ],
      skipDuplicates: true,
    });

    await prisma.pageResource.createMany({
      data: [
        {
          pageId: "intro-1",
          title: "MDN Web Docs - Estructuras de Documentación",
          url: "https://developer.mozilla.org/es/docs/MDN/Community",
          type: "ARTICLE",
          description: "Estándar de documentación jerárquica",
        },
        {
          pageId: "intro-2",
          title: "Documentación Oficial de Prisma ORM",
          url: "https://www.prisma.io/docs",
          type: "TOOL",
          description: "Ejemplo de relaciones y esquemas relacionales",
        },
      ],
      skipDuplicates: true,
    });

    console.log("Seed completed successfully!");
    console.log(`Root science: ${rootScience.title}`);
    console.log(`Introduction guide pages (intro-1, intro-2, intro-3) created`);
    console.log(`Physics and ${4} sub-topics created`);
    console.log(`Total hierarchical depth: 3 levels`);

    return {
      rootScience,
      intro1,
      intro2,
      intro3,
      physics,
      mechanics,
      thermodynamics,
      quantum,
      kinematics,
      dynamics,
    };
  } catch (error) {
    console.error("Seed error:", error);
    throw error;
  }
}
