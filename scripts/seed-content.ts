import prisma from "@/lib/prisma";

/**
 * Seed data: Hierarchical structure for knowledge base
 * Example: Sciences → Physics → Topics → Subtopics
 */
export async function seedHierarchicalContent() {
  try {
    // Clear existing data
    await prisma.page.deleteMany({});

    console.log("🌱 Seeding hierarchical content...");

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
        } as any,
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
        } as any,
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
        } as any,
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
        } as any,
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
        } as any,
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
        } as any,
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
        } as any,
      },
    });

    console.log("✅ Seed completed successfully!");
    console.log(`✓ Root science: ${rootScience.title}`);
    console.log(`✓ Physics and ${4} sub-topics created`);
    console.log(`✓ Total hierarchical depth: 3 levels`);

    return {
      rootScience,
      physics,
      mechanics,
      thermodynamics,
      quantum,
      kinematics,
      dynamics,
    };
  } catch (error) {
    console.error("❌ Seed error:", error);
    throw error;
  }
}
