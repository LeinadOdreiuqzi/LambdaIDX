"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Move,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavPage } from "@/types";

export interface TreeNode {
  id: string;
  parentId: string | null;
  title: string;
  slug: string;
  depth: number;
  childCount: number;
  children: TreeNode[];
}

// Built-in initial knowledge tree dataset
const INITIAL_TREE: TreeNode[] = [
  {
    id: "intro-1",
    parentId: null,
    title: "1. Introducción al Archivo",
    slug: "introduccion",
    depth: 0,
    childCount: 2,
    children: [
      {
        id: "intro-2",
        parentId: "intro-1",
        title: "Relaciones y Grafos",
        slug: "introduccion/relaciones-y-grafos",
        depth: 1,
        childCount: 0,
        children: [],
      },
      {
        id: "intro-3",
        parentId: "intro-1",
        title: "Búsqueda Instantánea",
        slug: "introduccion/busqueda-y-herramientas",
        depth: 1,
        childCount: 0,
        children: [],
      },
    ],
  },
  {
    id: "physics",
    parentId: null,
    title: "Física Fundamental",
    slug: "fisica",
    depth: 0,
    childCount: 2,
    children: [
      {
        id: "mechanics",
        parentId: "physics",
        title: "Mecánica Clásica",
        slug: "fisica/mecanica-clasica",
        depth: 1,
        childCount: 0,
        children: [],
      },
      {
        id: "quantum",
        parentId: "physics",
        title: "Física Cuántica",
        slug: "fisica/fisica-cuantica",
        depth: 1,
        childCount: 0,
        children: [],
      },
    ],
  },
  {
    id: "chemistry",
    parentId: null,
    title: "Química y Estructura",
    slug: "quimica",
    depth: 0,
    childCount: 2,
    children: [
      {
        id: "organic",
        parentId: "chemistry",
        title: "Química Orgánica",
        slug: "quimica/quimica-organica",
        depth: 1,
        childCount: 0,
        children: [],
      },
      {
        id: "inorganic",
        parentId: "chemistry",
        title: "Enlace Molecular",
        slug: "quimica/enlace-quimico",
        depth: 1,
        childCount: 0,
        children: [],
      },
    ],
  },
];

export function InteractiveKnowledgeGraph() {
  const router = useRouter();

  // Selected discipline filter
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [activeNodeId, setActiveNodeId] = useState<string>("intro-1");

  // Viewport Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState<number>(0.95);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Full hierarchical tree data
  const [treeData, setTreeData] = useState<TreeNode[]>(INITIAL_TREE);

  // Set of node IDs that are currently expanded (Progressive cascading)
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  // Positions of all rendered nodes on the canvas: { [nodeId]: { x: number, y: number } }
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    INITIAL_TREE.forEach((root, idx) => {
      pos[root.id] = { x: 80, y: 80 + idx * 130 };
    });
    return pos;
  });

  // Dragging state tracking (Zero jump, high-precision pointer capture)
  const dragRef = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    initNodeX: number;
    initNodeY: number;
  } | null>(null);

  // Canvas Panning state tracking
  const canvasPanRef = useRef<{
    startX: number;
    startY: number;
    initPanX: number;
    initPanY: number;
  } | null>(null);

  // Sync with real DB hierarchy in the background
  useEffect(() => {
    async function syncHierarchy() {
      try {
        const res = await fetch("/api/hierarchy/tree");
        const data = await res.json();

        if (data.success && data.tree && data.tree.length > 0) {
          const rawTree = data.tree as NavPage[];
          const formatted: TreeNode[] = rawTree.map((root) => ({
            id: root.id,
            parentId: null,
            title: root.title,
            slug: root.slug,
            depth: root.depth,
            childCount: (root.children || []).length,
            children: (root.children || []).map((child) => ({
              id: child.id,
              parentId: root.id,
              title: child.title,
              slug: child.slug,
              depth: child.depth,
              childCount: (child.children || []).length,
              children: (child.children || []).map((grandChild) => ({
                id: grandChild.id,
                parentId: child.id,
                title: grandChild.title,
                slug: grandChild.slug,
                depth: grandChild.depth,
                childCount: 0,
                children: [],
              })),
            })),
          }));

          setTreeData(formatted);

          // Position roots
          setNodePositions((prev) => {
            const next = { ...prev };
            formatted.forEach((root, idx) => {
              if (!next[root.id]) {
                next[root.id] = { x: 80, y: 80 + idx * 130 };
              }
            });
            return next;
          });
        }
      } catch (err) {
        console.warn("Using offline knowledge graph fallback:", err);
      }
    }

    syncHierarchy();
  }, []);

  // Quick lookup dictionary for all nodes in the tree
  const nodeDict = useMemo(() => {
    const dict: Record<string, TreeNode> = {};
    function populate(nodes: TreeNode[]) {
      nodes.forEach((n) => {
        dict[n.id] = n;
        if (n.children && n.children.length > 0) {
          populate(n.children);
        }
      });
    }
    populate(treeData);
    return dict;
  }, [treeData]);

  // Discipline Filter List for top pills
  const disciplinesList = useMemo(() => {
    function countNodes(n: TreeNode): number {
      let c = 1;
      if (n.children && n.children.length > 0) {
        c += n.children.reduce((sum, child) => sum + countNodes(child), 0);
      }
      return c;
    }

    const items = treeData.map((root) => ({
      id: root.id,
      name: root.title,
      count: countNodes(root),
    }));

    const totalCount = items.reduce((sum, item) => sum + item.count, 0);

    return [{ id: "all", name: "Todas las Ciencias", count: totalCount }, ...items];
  }, [treeData]);

  // Visible root nodes based on discipline filter
  const visibleRoots = useMemo(() => {
    return treeData.filter(
      (root) => selectedDiscipline === "all" || root.id === selectedDiscipline
    );
  }, [treeData, selectedDiscipline]);

  // List of all active parent->child connections
  const activeLinks = useMemo(() => {
    const links: { parentId: string; childId: string }[] = [];

    function findLinks(node: TreeNode) {
      if (expandedNodeIds.has(node.id) && node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          links.push({ parentId: node.id, childId: child.id });
          findLinks(child);
        });
      }
    }

    visibleRoots.forEach(findLinks);
    return links;
  }, [visibleRoots, expandedNodeIds]);

  // List of all currently visible nodes (Roots + Expanded children)
  const visibleNodeList = useMemo(() => {
    const list: TreeNode[] = [];

    function addVisible(node: TreeNode) {
      list.push(node);
      if (expandedNodeIds.has(node.id) && node.children && node.children.length > 0) {
        node.children.forEach(addVisible);
      }
    }

    visibleRoots.forEach(addVisible);
    return list;
  }, [visibleRoots, expandedNodeIds]);

  // Toggle Node Expansion with Dynamic Coordinate Positioning of Children
  const handleToggleExpand = useCallback(
    (nodeId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setActiveNodeId(nodeId);

      setExpandedNodeIds((prev) => {
        const next = new Set(prev);
        const isExpanding = !next.has(nodeId);

        if (isExpanding) {
          next.add(nodeId);

          // Compute children positions dynamically relative to parent's CURRENT position
          const parentNode = nodeDict[nodeId];
          const currentParentPos = nodePositions[nodeId] || { x: 80, y: 100 };

          if (parentNode && parentNode.children && parentNode.children.length > 0) {
            const children = parentNode.children;
            const count = children.length;
            const spacing = 80;
            const startY = currentParentPos.y - ((count - 1) * spacing) / 2;

            setNodePositions((posMap) => {
              const updated = { ...posMap };
              children.forEach((child, idx) => {
                updated[child.id] = {
                  x: currentParentPos.x + 280,
                  y: startY + idx * spacing,
                };
              });
              return updated;
            });
          }
        } else {
          // Collapse node and all descendants
          function collapseNode(id: string) {
            next.delete(id);
            const n = nodeDict[id];
            if (n && n.children) {
              n.children.forEach((c) => collapseNode(c.id));
            }
          }
          collapseNode(nodeId);
        }

        return next;
      });
    },
    [nodeDict, nodePositions]
  );

  // Handle header discipline filter select
  const handleSelectDiscipline = (discId: string) => {
    setSelectedDiscipline(discId);
    if (discId !== "all") {
      handleToggleExpand(discId);
    }
  };

  // Node Drag Handlers (100% stable, zero jump, zero transform conflict)
  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    const currentPos = nodePositions[nodeId] || { x: 80, y: 80 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      initNodeX: currentPos.x,
      initNodeY: currentPos.y,
    };
    setActiveNodeId(nodeId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // 1. If dragging a node card
    if (dragRef.current) {
      const { nodeId, startX, startY, initNodeX, initNodeY } = dragRef.current;
      const dx = (e.clientX - startX) / zoomLevel;
      const dy = (e.clientY - startY) / zoomLevel;

      setNodePositions((prev) => ({
        ...prev,
        [nodeId]: {
          x: initNodeX + dx,
          y: initNodeY + dy,
        },
      }));
      return;
    }

    // 2. If panning canvas background
    if (canvasPanRef.current) {
      const { startX, startY, initPanX, initPanY } = canvasPanRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      setPanOffset({
        x: initPanX + dx,
        y: initPanY + dy,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    dragRef.current = null;
    canvasPanRef.current = null;
  };

  // Canvas Pan Handler
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    canvasPanRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPanX: panOffset.x,
      initPanY: panOffset.y,
    };
  };

  // Reset View & Collapse All
  const handleResetView = useCallback(() => {
    setZoomLevel(0.95);
    setPanOffset({ x: 0, y: 0 });
    setSelectedDiscipline("all");
    setExpandedNodeIds(new Set());

    // Reset initial root positions
    const initialPos: Record<string, { x: number; y: number }> = {};
    treeData.forEach((root, idx) => {
      initialPos[root.id] = { x: 80, y: 80 + idx * 130 };
    });
    setNodePositions(initialPos);
    if (treeData.length > 0) {
      setActiveNodeId(treeData[0].id);
    }
  }, [treeData]);

  return (
    <div className="w-full max-w-6xl mx-auto mt-20 blueprint-border border rounded-2xl overflow-hidden bg-zinc-950/95 shadow-2xl relative select-none">
      {/* HEADER: Dynamic Discipline Filter Pills */}
      <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest hidden sm:flex">
          <Move className="w-3.5 h-3.5 text-zinc-400" />
          <span>Clic para desplegar sub-nodos • Arrastra nodos o fondo • Doble clic para abrir</span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar mx-auto sm:mx-0">
          {disciplinesList.map((disc) => {
            const isActive = selectedDiscipline === disc.id;
            return (
              <button
                key={disc.id}
                onClick={() => handleSelectDiscipline(disc.id)}
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

      {/* CANVAS VIEWPORT */}
      <div
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative aspect-[21/10] min-h-[480px] w-full overflow-hidden bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] cursor-grab active:cursor-grabbing touch-none"
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
            title="Restablecer Vista y Colapsar Nodos"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Motion Canvas */}
        <div
          style={{
            transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0px) scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Dynamic SVG Connection Lines for Active Links Only */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
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

            {activeLinks.map((link) => {
              const parentPos = nodePositions[link.parentId];
              const childPos = nodePositions[link.childId];
              if (!parentPos || !childPos) return null;

              const x1 = parentPos.x + 215; // Right edge anchor
              const y1 = parentPos.y + 24;
              const x2 = childPos.x; // Left edge anchor
              const y2 = childPos.y + 22;

              const curvature = Math.max(40, Math.abs(x2 - x1) * 0.45);
              const pathData = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;

              return (
                <path
                  key={`line-${link.parentId}-${link.childId}`}
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

          {/* Render All Currently Visible Nodes */}
          {visibleNodeList.map((node) => {
            const isRoot = node.depth === 0;
            const isActive = activeNodeId === node.id;
            const isExpanded = expandedNodeIds.has(node.id);
            const pos = nodePositions[node.id] || { x: 80, y: 80 };
            const hasChildren = (node.children && node.children.length > 0) || node.childCount > 0;

            return (
              <div
                key={node.id}
                onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                onClick={(e) => handleToggleExpand(node.id, e)}
                onDoubleClick={() => router.push(`/p/${node.slug}`)}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                }}
                className={cn(
                  "absolute z-10 cursor-grab active:cursor-grabbing p-3 rounded-xl border shadow-xl select-none backdrop-blur-md pointer-events-auto transition-colors",
                  isRoot ? "min-w-[215px]" : "min-w-[175px]",
                  isActive
                    ? "bg-zinc-900 border-zinc-200 ring-2 ring-white/10 shadow-zinc-500/10"
                    : "bg-zinc-950/95 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900/90",
                  isExpanded && "border-zinc-400"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0 transition-colors",
                        isActive
                          ? "bg-white text-black border-white"
                          : "bg-zinc-900 text-zinc-300 border-zinc-700"
                      )}
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-100 whitespace-nowrap max-w-[130px] truncate">
                        {node.title}
                      </h4>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter block mt-0.5">
                        {isRoot ? "Disciplina Raíz" : `Nivel ${node.depth}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Expand/Collapse Badge */}
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => handleToggleExpand(node.id, e)}
                        title={isExpanded ? "Colapsar temas" : "Desplegar temas"}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-0.5 transition-colors border",
                          isExpanded
                            ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20"
                        )}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            <span>{node.childCount}</span>
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-3 h-3" />
                            <span>+{node.childCount}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Direct Link to Document */}
                    <Link
                      href={`/p/${node.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      title="Abrir Documento"
                      className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      {isRoot ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ExternalLink className="w-3 h-3" />
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
