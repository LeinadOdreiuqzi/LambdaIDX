"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Check, Activity, Database, Compass, CornerDownRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type StreamTab = "experience" | "graph" | "tools";

const MISSION_STREAMS: Record<StreamTab, {
  id: string;
  tagline: string;
  headline: string;
  details: { code: string; label: string; text: string }[];
}> = {
  experience: {
    id: "01",
    tagline: "READING_ENGINE // EXPERIENCIA_DE_ESTUDIO",
    headline: "ENTORNO DE LECTURA TÉCNICA CON TIPOGRAFÍA MATEMÁTICA Y CÓDIGO FORMATEADO.",
    details: [
      {
        code: "01.1",
        label: "Soporte Nativo LaTeX & KaTeX",
        text: "Fórmulas matemáticas y ecuaciones complejas renderizadas vectorialmente dentro de cada página sin fallos de formato.",
      },
      {
        code: "01.2",
        label: "Bloques de Código Estructurados",
        text: "Demostraciones, algoritmos y scripts integrados con resaltado sintáctico multilenguaje de alta legibilidad.",
      },
      {
        code: "01.3",
        label: "Lectura Sin Distracciones",
        text: "Panel lateral colapsable y tipografía calibrada para reducir la fatiga visual en sesiones prolongadas de análisis.",
      },
    ],
  },
  graph: {
    id: "02",
    tagline: "KNOWLEDGE_GRAPH // RELACIONES_INTERDISCIPLINARIAS",
    headline: "SECUENCIACIÓN DE APRENDIZAJE BASADA EN PRERREQUISITOS Y DEPENDENCIAS.",
    details: [
      {
        code: "02.1",
        label: "Mapeo de Prerrequisitos",
        text: "Cada tema avanzado indica los conceptos previos indispensables para su comprensión, eliminando vacíos de conocimiento.",
      },
      {
        code: "02.2",
        label: "Ramificación Interdisciplinaria",
        text: "Descubre cómo un principio matemático conecta con modelos físicos y aplicaciones en química computacional.",
      },
      {
        code: "02.3",
        label: "Trazabilidad de Navegación",
        text: "Salta instantáneamente entre nodos adyacentes manteniendo la referencia exacta del árbol jerárquico de origen.",
      },
    ],
  },
  tools: {
    id: "03",
    tagline: "RESEARCH_SUITE // UTILIDADES_DEL_INVESTIGADOR",
    headline: "BÚSQUEDA EN PROFUNDIDAD CON RESALTADO Y BIBLIOTECA PERSONAL DE NODOS.",
    details: [
      {
        code: "03.1",
        label: "Búsqueda Jerárquica Directa",
        text: "Encuentra subconceptos en milisegundos con resaltado de términos e hipervínculos inmediatos al nodo correcto.",
      },
      {
        code: "03.2",
        label: "Colección de Favoritos",
        text: "Guarda y organiza nodos clave en tu panel personal para construir rutas rápidas de consulta diaria.",
      },
      {
        code: "03.3",
        label: "Estructura Citable Estándar",
        text: "Coordenadas estables (permalinks) y taxonomía uniforme que facilitan la referencia en trabajos académicos.",
      },
    ],
  },
};

export function IndustrialBrutalistMission() {
  const [activeTab, setActiveTab] = useState<StreamTab>("experience");
  const currentData = MISSION_STREAMS[activeTab];

  return (
    <section className="relative pt-20 pb-32 md:pt-28 md:pb-44 px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Corner Technical Crosshairs (+) */}
      <div className="absolute top-0 left-6 text-zinc-400 dark:text-zinc-600 font-mono text-xs select-none pointer-events-none">+</div>
      <div className="absolute top-0 right-6 text-zinc-400 dark:text-zinc-600 font-mono text-xs select-none pointer-events-none">+</div>
      <div className="absolute bottom-0 left-6 text-zinc-400 dark:text-zinc-600 font-mono text-xs select-none pointer-events-none">+</div>
      <div className="absolute bottom-0 right-6 text-zinc-400 dark:text-zinc-600 font-mono text-xs select-none pointer-events-none">+</div>

      {/* Brutalist Top Control Bar (Sin bordes de caja ni líneas divisoras) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
            SYS // ESPECIFICACIONES_TÉCNICAS
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            CORPUS_ID: L-IDX-001
          </span>
        </div>

        {/* Industrial Tab Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {(["experience", "graph", "tools"] as StreamTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const tabData = MISSION_STREAMS[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer relative",
                  isActive
                    ? "text-black dark:text-white"
                    : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                <span>{tabData.id} / {tab === "experience" ? "LECTURA" : tab === "graph" ? "RELACIONES" : "HERRAMIENTAS"}</span>
                {isActive && (
                  <motion.div
                    layoutId="industrial-tab-line"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Brutalist Headline & Stream Reveal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="pt-10"
        >
          {/* Tagline Badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
            <CornerDownRight className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>{currentData.tagline}</span>
          </div>

          {/* Brutalist Typography - Escala tipográfica secundaria ajustada respetando el H1 principal */}
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-black dark:text-white leading-snug max-w-5xl mb-12">
            {currentData.headline}
          </h2>

          {/* Industrial Details Grid (Sin líneas divisoras) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {currentData.details.map((item) => (
              <div key={item.code} className="space-y-3 group">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-600 tracking-widest group-hover:text-black dark:group-hover:text-white transition-colors">
                    [{item.code}]
                  </span>
                  <Zap className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 group-hover:text-black dark:group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-tight text-black dark:text-white">
                  {item.label}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
