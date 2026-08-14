"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUpRight,
  ExternalLink,
  Move,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NodePosition {
  id: string;
  parentId?: string;
  title: string;
  slug: string;
  category: string;
  depth: number;
  x: number; // Pixel X position
  y: number; // Pixel Y position
}

const INITIAL_DISCIPLINES = [
  { id: "all", name: "Todas las Ciencias", count: 9 },
  { id: "intro-1", name: "1. Introducción", count: 3 },
  { id: "physics", name: "Física Fundamental", count: 3 },
  { id: "chemistry", name: "Química y Estructura", count: 3 },
];

const DEFAULT_NODE_POSITIONS: NodePosition[] = [
  // Branch 1: Introducción
  {
    id: "intro-1",
    title: "Cartografía del Conocimiento",
    slug: "introduccion",
    category: "1. Introducción",
    depth: 0,
    x: 140,
    y: 110,
  },
  {
    id: "intro-2",
    parentId: "intro-1",
    title: "Relaciones y Grafos",
    slug: "introduccion/relaciones-y-grafos",
    category: "1. Introducción",
    depth: 1,
    x: 440,
    y: 60,
  },
  {
    id: "intro-3",
    parentId: "intro-1",
    title: "Búsqueda Rápida",
    slug: "introduccion/busqueda-y-herramientas",
    category: "1. Introducción",
    depth: 1,
    x: 440,
    y: 165,
  },

  // Branch 2: Física
  {
    id: "physics",
    title: "Física Fundamental",
    slug: "fisica",
    category: "Física Fundamental",
    depth: 0,
    x: 140,
    y: 280,
  },
  {
    id: "mechanics",
    parentId: "physics",
    title: "Mecánica Clásica",
    slug: "fisica/mecanica-clasica",
    category: "Física Fundamental",
    depth: 1,
    x: 440,
    y: 230,
  },
  {
    id: "quantum",
    parentId: "physics",
    title: "Física Cuántica",
    slug: "fisica/fisica-cuantica",
    category: "Física Fundamental",
    depth: 1,
    x: 440,
    y: 330,
  },

  // Branch 3: Química
  {
    id: "chemistry",
    title: "Química y Estructura",
    slug: "quimica",
    category: "Química y Estructura",
    depth: 0,
    x: 710,
    y: 180,
  },
  {
    id: "organic",
    parentId: "chemistry",
    title: "Química Orgánica",
    slug: "quimica/quimica-organica",
    category: "Química y Estructura",
    depth: 1,
    x: 980,
    y: 130,
  },
  {
    id: "inorganic",
    parentId: "chemistry",
    title: "Enlace Molecular",
    slug: "quimica/enlace-quimico",
    category: "Química y Estructura",
    depth: 1,
    x: 980,
    y: 230,
  },
];

export function InteractiveKnowledgeGraph() {
  const router = useRouter();

  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [activeNodeId, setActiveNodeId] = useState<string>("intro-1");
  const [zoomLevel, setZoomLevel] = useState<number>(0.95);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [nodes, setNodes] = useState<NodePosition[]>(DEFAULT_NODE_POSITIONS);

  const [isPanningCanvas, setIsPanningCanvas] = useState(false);

  // Drag Node State
  const dragNodeRef = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    initialNodeX: number;
    initialNodeY: number;
  } | null>(null);

  // Canvas Pan State
  const panCanvasRef = useRef<{
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
  } | null>(null);

  // Node Drag Handlers
  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragNodeRef.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      initialNodeX: node.x,
      initialNodeY: node.y,
    };
    setActiveNodeId(nodeId);
  };

  // Canvas Pan Handlers
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // Start Canvas Pan if not dragging a node
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsPanningCanvas(true);
    panCanvasRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. If Node Dragging
    if (dragNodeRef.current) {
      const { nodeId, startX, startY, initialNodeX, initialNodeY } = dragNodeRef.current;
      const deltaX = (e.clientX - startX) / zoomLevel;
      const deltaY = (e.clientY - startY) / zoomLevel;

      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId ? { ...n, x: initialNodeX + deltaX, y: initialNodeY + deltaY } : n
        )
      );
      return;
    }

    // 2. If Canvas Panning
    if (panCanvasRef.current) {
      const { startX, startY, initialPanX, initialPanY } = panCanvasRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      setPanOffset({
        x: initialPanX + deltaX,
        y: initialPanY + deltaY,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if capture already released
    }
    dragNodeRef.current = null;
    panCanvasRef.current = null;
    setIsPanningCanvas(false);
  };

  const handleResetView = useCallback(() => {
    setZoomLevel(0.95);
    setPanOffset({ x: 0, y: 0 });
    setSelectedDiscipline("all");
    setNodes(DEFAULT_NODE_POSITIONS);
    setActiveNodeId("intro-1");
  }, []);

  const handleNavigateToNode = (slug: string) => {
    router.push(`/p/${slug}`);
  };

  const visibleNodes = nodes.filter((n) => {
    if (selectedDiscipline === "all") return true;
    if (n.id === selectedDiscipline) return true;
    if (n.parentId === selectedDiscipline) return true;
    return false;
  });

  return (
    <div className="w-full max-w-6xl mx-auto mt-20 blueprint-border border rounded-2xl overflow-hidden bg-zinc-950/95 shadow-2xl relative select-none">
      {/* HEADER: Discipline Filter Pills */}
      <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest hidden sm:flex">
          <Move className="w-3.5 h-3.5 text-zinc-400" />
          <span>Navega arrastrando el fondo • Arrastra nodos • Doble clic para abrir</span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar mx-auto sm:mx-0">
          {INITIAL_DISCIPLINES.map((disc) => {
            const isActive = selectedDiscipline === disc.id;
            return (
              <button
                key={disc.id}
                onClick={() => {
                  setSelectedDiscipline(disc.id);
                  if (disc.id !== "all") {
                    setActiveNodeId(disc.id);
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap",
                  isActive
                    ? "bg-white text-black font-bold shadow-md shadow-white/10"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800"
                )}
              >
                <span>{disc.name}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    isActive ? "bg-zinc-200 text-black" : "bg-zinc-800 text-zinc-500"
                  )}
                >
                  {disc.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE CANVAS VIEWPORT */}
      <div
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={cn(
          "relative aspect-[21/10] min-h-[460px] w-full overflow-hidden bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] touch-none",
          isPanningCanvas ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        {/* Controls Overlay */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-1.5 rounded-xl shadow-lg"
        >
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.3))}
            title="Aumentar Zoom"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.65))}
            title="Reducir Zoom"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <button
            onClick={handleResetView}
            title="Restablecer Vista y Posición"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Motion Canvas (Responds to Pan Offset and Zoom Level) */}
        <motion.div
          animate={{
            x: panOffset.x,
            y: panOffset.y,
            scale: zoomLevel,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Synchronous Vector Connecting Lines with Moving Gray Gradient */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient
                id="gray-animated-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#27272a" />
                <stop offset="35%" stopColor="#71717a" />
                <stop offset="70%" stopColor="#d4d4d8" />
                <stop offset="100%" stopColor="#27272a" />
                <animate
                  attributeName="x1"
                  from="-100%"
                  to="100%"
                  dur="3.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="x2"
                  from="0%"
                  to="200%"
                  dur="3.5s"
                  repeatCount="indefinite"
                />
              </linearGradient>
            </defs>

            {visibleNodes.map((childNode) => {
              if (!childNode.parentId) return null;
              const parentNode = nodes.find((n) => n.id === childNode.parentId);
              if (!parentNode) return null;

              const linkKey = `${childNode.parentId}-${childNode.id}`;
              const x1 = parentNode.x + 95;
              const y1 = parentNode.y + 22;
              const x2 = childNode.x;
              const y2 = childNode.y + 22;
              const curvature = Math.abs(x2 - x1) * 0.45;
              const pathData = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;

              return (
                <path
                  key={linkKey}
                  d={pathData}
                  stroke="url(#gray-animated-gradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="4 4"
                  className="opacity-90"
                />
              );
            })}
          </svg>

          {/* Dynamic Node Cards */}
          <AnimatePresence>
            {visibleNodes.map((node) => {
              const isRoot = node.depth === 0;
              const isActive = activeNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                  onDoubleClick={() => handleNavigateToNode(node.slug)}
                  style={{
                    transform: `translate3d(${node.x}px, ${node.y}px, 0px)`,
                  }}
                  className={cn(
                    "absolute top-0 left-0 z-10 cursor-grab active:cursor-grabbing p-3 rounded-xl border shadow-xl transition-colors select-none backdrop-blur-md",
                    isRoot ? "min-w-[190px]" : "min-w-[165px]",
                    isActive
                      ? "bg-zinc-900 border-zinc-300 ring-2 ring-zinc-500/20 shadow-zinc-500/10"
                      : "bg-zinc-950/95 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900/90"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0",
                          isActive
                            ? "bg-white text-black border-white"
                            : "bg-zinc-900 text-zinc-300 border-zinc-700"
                        )}
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-zinc-100 whitespace-nowrap">
                          {node.title}
                        </h4>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter block mt-0.5">
                          {isRoot ? "Disciplina Raíz" : "Sub-nodo"}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/p/${node.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      title="Abrir Documento Directo"
                      className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                    >
                      {isRoot ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ExternalLink className="w-3 h-3" />
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
