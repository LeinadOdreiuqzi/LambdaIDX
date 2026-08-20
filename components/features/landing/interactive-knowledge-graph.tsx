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
  Loader2,
  GitBranch,
  Search,
  X,
  MapPin,
  Maximize2,
  Keyboard,
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

// Built-in rich multi-level knowledge tree dataset for instant 0ms rendering
const INITIAL_TREE: TreeNode[] = [
  {
    id: "intro-1",
    parentId: null,
    title: "1. Introduccion al Archivo",
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
        childCount: 1,
        children: [
          {
            id: "intro-2-1",
            parentId: "intro-2",
            title: "Grafos de Dependencia",
            slug: "introduccion/relaciones-y-grafos/dependencias",
            depth: 2,
            childCount: 0,
            children: [],
          },
        ],
      },
      {
        id: "intro-3",
        parentId: "intro-1",
        title: "Busqueda Instantanea",
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
    title: "Fisica Fundamental",
    slug: "fisica",
    depth: 0,
    childCount: 2,
    children: [
      {
        id: "mechanics",
        parentId: "physics",
        title: "Mecanica Clasica",
        slug: "fisica/mecanica-clasica",
        depth: 1,
        childCount: 2,
        children: [
          {
            id: "mechanics-1",
            parentId: "mechanics",
            title: "Leyes del Movimiento",
            slug: "fisica/mecanica-clasica/leyes-de-newton",
            depth: 2,
            childCount: 0,
            children: [],
          },
          {
            id: "mechanics-2",
            parentId: "mechanics",
            title: "Cinematica y Dinamica",
            slug: "fisica/mecanica-clasica/cinematica",
            depth: 2,
            childCount: 0,
            children: [],
          },
        ],
      },
      {
        id: "quantum",
        parentId: "physics",
        title: "Fisica Cuantica",
        slug: "fisica/fisica-cuantica",
        depth: 1,
        childCount: 1,
        children: [
          {
            id: "quantum-1",
            parentId: "quantum",
            title: "Dualidad Onda-Particula",
            slug: "fisica/fisica-cuantica/dualidad",
            depth: 2,
            childCount: 0,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: "chemistry",
    parentId: null,
    title: "Quimica y Estructura",
    slug: "quimica",
    depth: 0,
    childCount: 2,
    children: [
      {
        id: "organic",
        parentId: "chemistry",
        title: "Quimica Organica",
        slug: "quimica/quimica-organica",
        depth: 1,
        childCount: 2,
        children: [
          {
            id: "organic-1",
            parentId: "organic",
            title: "Hidrocarburos y Enlaces",
            slug: "quimica/quimica-organica/hidrocarburos",
            depth: 2,
            childCount: 0,
            children: [],
          },
          {
            id: "organic-2",
            parentId: "organic",
            title: "Reacciones Biologicas",
            slug: "quimica/quimica-organica/reacciones",
            depth: 2,
            childCount: 0,
            children: [],
          },
        ],
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

  // Viewport Container Reference
  const viewportRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected discipline filter
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [activeNodeId, setActiveNodeId] = useState<string>("intro-1");

  // Viewport Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState<number>(0.95);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Full hierarchical tree data
  const [treeData, setTreeData] = useState<TreeNode[]>(INITIAL_TREE);

  // Set of node IDs that are currently expanded (Progressive multi-level cascading)
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  // Currently dragging node ID (for active elevation state)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Loading state for lazy fetching specific sub-branches
  const [loadingNodeId, setLoadingNodeId] = useState<string | null>(null);

  // Quick Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

  // Positions of all rendered nodes on the canvas: { [nodeId]: { x: number, y: number } }
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    INITIAL_TREE.forEach((root, idx) => {
      pos[root.id] = { x: 60, y: 70 + idx * 130 };
    });
    return pos;
  });

  // Keep refs in sync inside useEffect for React 19 safety
  const nodePositionsRef = useRef(nodePositions);
  const zoomLevelRef = useRef(zoomLevel);
  const panOffsetRef = useRef(panOffset);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    nodePositionsRef.current = nodePositions;
  }, [nodePositions]);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  // Multi-Touch & Pointer Tracking State
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStateRef = useRef<{
    initialDistance: number;
    initialZoom: number;
    initialMidpoint: { x: number; y: number };
    initialPan: { x: number; y: number };
  } | null>(null);

  const dragInfoRef = useRef<{
    nodeId: string | null;
    isPanningCanvas: boolean;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
    hasMoved: boolean;
  }>({
    nodeId: null,
    isPanningCanvas: false,
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    hasMoved: false,
  });

  // Global Window Pointer Move & Up listeners for 60fps smooth dragging & pinch-to-zoom
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (activePointersRef.current.has(e.pointerId)) {
        activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Multi-Touch Pinch-to-Zoom Gesture (2 pointers)
      if (activePointersRef.current.size === 2) {
        const pointers = Array.from(activePointersRef.current.values());
        const p1 = pointers[0];
        const p2 = pointers[1];
        const currentDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        if (!pinchStateRef.current) {
          pinchStateRef.current = {
            initialDistance: currentDistance,
            initialZoom: zoomLevelRef.current,
            initialMidpoint: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
            initialPan: panOffsetRef.current,
          };
        } else {
          const { initialDistance, initialZoom, initialMidpoint, initialPan } = pinchStateRef.current;
          if (initialDistance > 0) {
            const scaleFactor = currentDistance / initialDistance;
            const newZoom = Math.max(0.5, Math.min(1.4, initialZoom * scaleFactor));
            setZoomLevel(newZoom);

            const currentMidpoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            const panDx = currentMidpoint.x - initialMidpoint.x;
            const panDy = currentMidpoint.y - initialMidpoint.y;

            setPanOffset({
              x: initialPan.x + panDx,
              y: initialPan.y + panDy,
            });
          }
        }
        return;
      }

      if (activePointersRef.current.size < 2) {
        pinchStateRef.current = null;
      }

      // Single Pointer Drag or Pan
      const drag = dragInfoRef.current;
      if (!drag.nodeId && !drag.isPanningCanvas) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (!drag.hasMoved && Math.hypot(dx, dy) > 4) {
        drag.hasMoved = true;
      }

      // Dragging node card
      if (drag.nodeId) {
        const zoom = zoomLevelRef.current;
        const newX = drag.initX + dx / zoom;
        const newY = drag.initY + dy / zoom;

        setNodePositions((prev) => ({
          ...prev,
          [drag.nodeId!]: { x: newX, y: newY },
        }));
      }

      // Panning canvas background
      if (drag.isPanningCanvas) {
        setPanOffset({
          x: drag.initX + dx,
          y: drag.initY + dy,
        });
      }
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId);
      if (activePointersRef.current.size < 2) {
        pinchStateRef.current = null;
      }

      if (dragInfoRef.current.nodeId || dragInfoRef.current.isPanningCanvas) {
        setDraggingNodeId(null);
        dragInfoRef.current.nodeId = null;
        dragInfoRef.current.isPanningCanvas = false;
      }
    };

    window.addEventListener("pointermove", handleGlobalPointerMove, { passive: true });
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, []);

  // Trackpad & Mouse Wheel Zoom Handler
  useEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomDelta = -e.deltaY * 0.005;
        setZoomLevel((prev) => Math.max(0.5, Math.min(1.4, prev + zoomDelta)));
      } else {
        e.preventDefault();
        setPanOffset((prev) => ({
          x: prev.x - e.deltaX * 0.8,
          y: prev.y - e.deltaY * 0.8,
        }));
      }
    };

    viewportEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewportEl.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Sync with real DB hierarchy in the background
  useEffect(() => {
    let isMounted = true;

    async function syncHierarchy() {
      try {
        const res = await fetch("/api/hierarchy/tree");
        const data = await res.json();

        if (!isMounted) return;

        if (data.success && data.tree && data.tree.length > 0) {
          const rawTree = data.tree as NavPage[];

          function formatRawNode(n: NavPage, pId: string | null = null): TreeNode {
            const formattedChildren = (n.children || []).map((c) => formatRawNode(c, n.id));
            return {
              id: n.id,
              parentId: pId,
              title: n.title,
              slug: n.slug,
              depth: n.depth,
              childCount: formattedChildren.length,
              children: formattedChildren,
            };
          }

          const formatted: TreeNode[] = rawTree.map((root) => formatRawNode(root, null));
          if (!isMounted) return;

          setTreeData(formatted);

          setNodePositions((prev) => {
            const next = { ...prev };
            formatted.forEach((root, idx) => {
              if (!next[root.id]) {
                next[root.id] = { x: 60, y: 70 + idx * 130 };
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

    return () => {
      isMounted = false;
    };
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

  // List of all active parent->child connections (Recursive multi-level)
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

  // List of all currently visible nodes (Roots + All Expanded Descendants)
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

  // Active Ancestor Path (Breadcrumbs)
  const activeBreadcrumbs = useMemo(() => {
    if (!activeNodeId) return [];
    const path: TreeNode[] = [];
    let curr: TreeNode | undefined = nodeDict[activeNodeId];

    while (curr) {
      path.unshift(curr);
      curr = curr.parentId ? nodeDict[curr.parentId] : undefined;
    }

    return path;
  }, [activeNodeId, nodeDict]);

  // In-Graph Search Results Filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    const matches: TreeNode[] = [];

    Object.values(nodeDict).forEach((node) => {
      if (
        node.title.toLowerCase().includes(query) ||
        node.slug.toLowerCase().includes(query)
      ) {
        matches.push(node);
      }
    });

    return matches.slice(0, 6);
  }, [searchQuery, nodeDict]);

  // Toggle Node Expansion with Dynamic Anti-Collision Positioning
  const handleToggleExpand = useCallback(
    async (nodeId: string, e?: React.MouseEvent | React.TouchEvent) => {
      if (e) e.stopPropagation();
      setActiveNodeId(nodeId);

      const node = nodeDict[nodeId];
      if (!node) return;

      const isExpanding = !expandedNodeIds.has(nodeId);

      if (isExpanding) {
        if (node.childCount > 0 && node.children.length === 0) {
          setLoadingNodeId(nodeId);
          try {
            const res = await fetch(`/api/hierarchy/tree?nodeId=${node.id}`);
            const data = await res.json();
            if (data.success && data.tree && data.tree.length > 0) {
              const fetchedSubtree = data.tree[0] as NavPage;
              const formattedChildren: TreeNode[] = (fetchedSubtree.children || []).map((c) => ({
                id: c.id,
                parentId: node.id,
                title: c.title,
                slug: c.slug,
                depth: c.depth,
                childCount: (c.children || []).length,
                children: (c.children || []).map((gc) => ({
                  id: gc.id,
                  parentId: c.id,
                  title: gc.title,
                  slug: gc.slug,
                  depth: gc.depth,
                  childCount: 0,
                  children: [],
                })),
              }));

              setTreeData((prevTree) => {
                function attachChildren(nodes: TreeNode[]): TreeNode[] {
                  return nodes.map((n) => {
                    if (n.id === nodeId) {
                      return { ...n, children: formattedChildren, childCount: formattedChildren.length };
                    }
                    if (n.children && n.children.length > 0) {
                      return { ...n, children: attachChildren(n.children) };
                    }
                    return n;
                  });
                }
                return attachChildren(prevTree);
              });
            }
          } catch (err) {
            console.error("Failed to fetch lazy sub-branch:", err);
          } finally {
            setLoadingNodeId(null);
          }
        }

        // Position children dynamically relative to parent's CURRENT coordinates
        const currentParentPos = nodePositionsRef.current[nodeId] || { x: 60, y: 100 };
        const children = node.children;

        if (children && children.length > 0) {
          const count = children.length;
          const spacing = 82;
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

        setExpandedNodeIds((prev) => new Set([...prev, nodeId]));
      } else {
        // Collapse node and all descendants
        setExpandedNodeIds((prev) => {
          const next = new Set(prev);
          function collapseNode(id: string) {
            next.delete(id);
            const n = nodeDict[id];
            if (n && n.children) {
              n.children.forEach((c) => collapseNode(c.id));
            }
          }
          collapseNode(nodeId);
          return next;
        });
      }
    },
    [nodeDict, expandedNodeIds]
  );

  // Select search match with auto-unfolding and camera pan
  const handleSelectSearchResult = (node: TreeNode) => {
    const ancestors: string[] = [];
    let curr: TreeNode | undefined = node.parentId ? nodeDict[node.parentId] : undefined;
    while (curr) {
      ancestors.unshift(curr.id);
      curr = curr.parentId ? nodeDict[curr.parentId] : undefined;
    }

    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      ancestors.forEach((aId) => next.add(aId));
      if (node.childCount > 0) next.add(node.id);
      return next;
    });

    if (ancestors.length > 0) {
      setSelectedDiscipline("all");
    }

    setActiveNodeId(node.id);
    setSearchQuery("");
    setIsSearchFocused(false);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      const pos = nodePositionsRef.current[node.id] || { x: 60, y: 80 };
      setPanOffset({
        x: -(pos.x - 200),
        y: -(pos.y - 170),
      });
      setZoomLevel(1.0);
    }, 50);
  };

  // Smart Auto-Center / Fit Graph to Viewport
  const handleAutoCenter = useCallback(() => {
    const visiblePositions = visibleNodeList
      .map((n) => nodePositionsRef.current[n.id])
      .filter(Boolean);

    if (visiblePositions.length === 0) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    visiblePositions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x + 220);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y + 70);
    });

    const clusterCenterX = (minX + maxX) / 2;
    const clusterCenterY = (minY + maxY) / 2;

    const viewportW = viewportRef.current ? viewportRef.current.clientWidth : 900;
    const viewportH = viewportRef.current ? viewportRef.current.clientHeight : 480;

    const targetPanX = viewportW / 2 - clusterCenterX;
    const targetPanY = viewportH / 2 - clusterCenterY;

    setPanOffset({ x: targetPanX, y: targetPanY });
    setZoomLevel(0.92);
  }, [visibleNodeList]);

  // Handle header discipline filter select
  const handleSelectDiscipline = (discId: string) => {
    setSelectedDiscipline(discId);
    if (discId !== "all") {
      handleToggleExpand(discId);
    }
  };

  // Start dragging a node card
  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const currentPos = nodePositionsRef.current[nodeId] || { x: 60, y: 80 };

    dragInfoRef.current = {
      nodeId,
      isPanningCanvas: false,
      startX: e.clientX,
      startY: e.clientY,
      initX: currentPos.x,
      initY: currentPos.y,
      hasMoved: false,
    };

    setDraggingNodeId(nodeId);
    setActiveNodeId(nodeId);
  };

  // Start panning the canvas background
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (e.target !== e.currentTarget && !viewportRef.current?.contains(e.target as Node)) return;

    dragInfoRef.current = {
      nodeId: null,
      isPanningCanvas: true,
      startX: e.clientX,
      startY: e.clientY,
      initX: panOffsetRef.current.x,
      initY: panOffsetRef.current.y,
      hasMoved: false,
    };
  };

  // Node Card Click Handler
  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    if (dragInfoRef.current.hasMoved) return;
    handleToggleExpand(nodeId, e);
  };

  // Reset View & Collapse All
  const handleResetView = useCallback(() => {
    setZoomLevel(0.95);
    setPanOffset({ x: 0, y: 0 });
    setSelectedDiscipline("all");
    setExpandedNodeIds(new Set());

    const initialPos: Record<string, { x: number; y: number }> = {};
    treeData.forEach((root, idx) => {
      initialPos[root.id] = { x: 60, y: 70 + idx * 130 };
    });
    setNodePositions(initialPos);
    if (treeData.length > 0) {
      setActiveNodeId(treeData[0].id);
    }
  }, [treeData]);

  // Keyboard Navigation Engine
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isSearchFocused) {
        if (e.key === "Escape") {
          setIsSearchFocused(false);
          searchInputRef.current?.blur();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
        return;
      }

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const currIdx = visibleNodeList.findIndex((n) => n.id === activeNodeId);
          if (currIdx < visibleNodeList.length - 1) {
            setActiveNodeId(visibleNodeList[currIdx + 1].id);
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const currIdx = visibleNodeList.findIndex((n) => n.id === activeNodeId);
          if (currIdx > 0) {
            setActiveNodeId(visibleNodeList[currIdx - 1].id);
          }
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const currNode = nodeDict[activeNodeId];
          if (currNode && currNode.childCount > 0) {
            if (!expandedNodeIds.has(currNode.id)) {
              handleToggleExpand(currNode.id);
            } else if (currNode.children && currNode.children.length > 0) {
              setActiveNodeId(currNode.children[0].id);
            }
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          const currNode = nodeDict[activeNodeId];
          if (currNode) {
            if (expandedNodeIds.has(currNode.id)) {
              handleToggleExpand(currNode.id);
            } else if (currNode.parentId) {
              setActiveNodeId(currNode.parentId);
            }
          }
          break;
        }
        case " ":
        case "Enter": {
          e.preventDefault();
          if (activeNodeId) {
            handleToggleExpand(activeNodeId);
          }
          break;
        }
        case "+":
        case "=": {
          e.preventDefault();
          setZoomLevel((prev) => Math.min(prev + 0.1, 1.3));
          break;
        }
        case "-":
        case "_": {
          e.preventDefault();
          setZoomLevel((prev) => Math.max(prev - 0.1, 0.65));
          break;
        }
        case "0":
        case "Home": {
          e.preventDefault();
          handleAutoCenter();
          break;
        }
        case "Escape": {
          setIsSearchFocused(false);
          setShowKeyboardHelp(false);
          break;
        }
      }
    },
    [isSearchFocused, visibleNodeList, activeNodeId, nodeDict, expandedNodeIds, handleToggleExpand, handleAutoCenter]
  );

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Grafo de Conocimiento Interactivo"
      className="w-full max-w-6xl mx-auto mt-20 blueprint-border border rounded-2xl overflow-hidden bg-zinc-950/95 shadow-2xl relative select-none touch-none focus:outline-none focus:ring-1 focus:ring-zinc-700"
    >
      {/* HEADER: Dynamic Discipline Filter Pills & Quick Search */}
      <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Live In-Graph Search Bar */}
        <div className="relative w-full sm:w-64">
          <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 focus-within:border-cyan-500/50 rounded-lg px-2.5 py-1.5 transition-colors">
            <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Buscar en el grafo (Ctrl+K)..."
              className="bg-transparent text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Floating Panel */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 w-full sm:w-80 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Resultados ({searchResults.length})</span>
                <span>Auto-Focus</span>
              </div>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-zinc-800/90 text-xs transition-colors flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-bold text-zinc-200 group-hover:text-white truncate">
                      {result.title}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                    {result.depth === 0 ? "Raiz" : `Nivel ${result.depth}`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Discipline Filter Pills & Node Counter */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full no-scrollbar -webkit-overflow-scrolling-touch">
          <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-zinc-500 mr-1 shrink-0">
            <span>Visibles:</span>
            <span className="font-bold text-zinc-300">{visibleNodeList.length}</span>
          </div>

          {disciplinesList.map((disc) => {
            const isActive = selectedDiscipline === disc.id;
            return (
              <button
                key={disc.id}
                onClick={() => handleSelectDiscipline(disc.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95",
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

      {/* CANVAS VIEWPORT (Touch & Multi-Touch & Keyboard Optimized) */}
      <div
        ref={viewportRef}
        onPointerDown={handleCanvasPointerDown}
        role="tree"
        aria-label="Lienzo de navegacion jerarquica"
        className="relative aspect-[21/10] min-h-[440px] sm:min-h-[500px] w-full overflow-hidden bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] cursor-grab active:cursor-grabbing touch-none select-none"
      >
        {/* Top-Right Controls Overlay */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-1.5 rounded-xl shadow-lg"
        >
          <button
            onClick={() => setShowKeyboardHelp((prev) => !prev)}
            title="Atajos de Teclado"
            className={cn(
              "p-2 sm:p-2 rounded-lg transition-colors active:scale-95",
              showKeyboardHelp
                ? "text-cyan-400 bg-cyan-500/10"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button
            onClick={handleAutoCenter}
            title="Centrar y Ajustar Grafo al Lienzo (0)"
            className="p-2 sm:p-2 text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.3))}
            title="Aumentar Zoom (+)"
            className="p-2 sm:p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.65))}
            title="Reducir Zoom (-)"
            className="p-2 sm:p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            title="Restablecer Vista y Colapsar Nodos"
            className="p-2 sm:p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard Help Floating Modal */}
        {showKeyboardHelp && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-16 right-4 z-40 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 p-3.5 rounded-xl shadow-2xl font-mono text-[11px] text-zinc-300 w-64 space-y-2"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <span className="font-bold text-zinc-100 uppercase tracking-wider text-[10px]">
                Atajos de Teclado
              </span>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 text-zinc-400 text-[10px]">
              <div className="flex justify-between">
                <span>Navegar nodos:</span>
                <span className="text-zinc-200 font-bold">Flechas ↑ ↓ ← →</span>
              </div>
              <div className="flex justify-between">
                <span>Expandir / Colapsar:</span>
                <span className="text-zinc-200 font-bold">Espacio / Enter</span>
              </div>
              <div className="flex justify-between">
                <span>Buscar en el grafo:</span>
                <span className="text-zinc-200 font-bold">Ctrl + K</span>
              </div>
              <div className="flex justify-between">
                <span>Auto-Centrar vista:</span>
                <span className="text-zinc-200 font-bold">0 / Home</span>
              </div>
              <div className="flex justify-between">
                <span>Zoom in / out:</span>
                <span className="text-zinc-200 font-bold">+ / -</span>
              </div>
            </div>
          </div>
        )}

        {/* GPU-Accelerated Dynamic Motion Canvas */}
        <div
          style={{
            transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0px) scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
          className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
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

          {/* Render All Currently Visible Nodes (Multi-Level Cascading) */}
          {visibleNodeList.map((node) => {
            const isRoot = node.depth === 0;
            const isActive = activeNodeId === node.id;
            const isExpanded = expandedNodeIds.has(node.id);
            const isDragging = draggingNodeId === node.id;
            const isNodeLoading = loadingNodeId === node.id;
            const pos = nodePositions[node.id] || { x: 60, y: 80 };
            const hasChildren = (node.children && node.children.length > 0) || node.childCount > 0;

            return (
              <div
                key={node.id}
                role="treeitem"
                aria-selected={isActive}
                aria-expanded={hasChildren ? isExpanded : undefined}
                onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                onClick={(e) => handleNodeClick(e, node.id)}
                onDoubleClick={() => router.push(`/index/${node.slug}`)}
                style={{
                  transform: `translate3d(${pos.x}px, ${pos.y}px, 0px)`,
                  willChange: "transform",
                }}
                className={cn(
                  "absolute top-0 left-0 p-3 rounded-xl border select-none backdrop-blur-md pointer-events-auto transition-[border-color,background-color,box-shadow]",
                  isDragging
                    ? "cursor-grabbing z-50 shadow-2xl scale-[1.03] ring-2 ring-cyan-400 border-cyan-400"
                    : "cursor-grab z-10 shadow-xl",
                  isRoot ? "min-w-[195px] sm:min-w-[215px]" : "min-w-[170px] sm:min-w-[185px]",
                  isActive && !isDragging
                    ? "bg-zinc-900 border-zinc-200 ring-2 ring-cyan-500/40 shadow-cyan-500/10"
                    : !isDragging
                    ? "bg-zinc-950/95 border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900/90"
                    : "",
                  isExpanded && !isDragging && "border-zinc-400"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0 transition-colors",
                        isActive
                          ? "bg-white text-black border-white shadow-sm shadow-white/20"
                          : isRoot
                          ? "bg-zinc-900 text-zinc-300 border-zinc-700"
                          : "bg-zinc-900/80 text-zinc-400 border-zinc-800"
                      )}
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-100 whitespace-nowrap max-w-[120px] sm:max-w-[130px] truncate">
                        {node.title}
                      </h4>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter block mt-0.5">
                        {isRoot ? "Disciplina Raiz" : `Nivel ${node.depth}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Expand/Collapse Badge with Subtree Fetch Loading Indicator */}
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => handleToggleExpand(node.id, e)}
                        title={isExpanded ? "Colapsar temas" : "Desplegar temas"}
                        disabled={isNodeLoading}
                        className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-0.5 transition-colors border active:scale-90",
                          isExpanded
                            ? "bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700"
                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20"
                        )}
                      >
                        {isNodeLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                        ) : isExpanded ? (
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
                      href={`/index/${node.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      title="Abrir Documento"
                      className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors active:scale-90"
                    >
                      {isRoot ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTIVE BREADCRUMB BAR (Interactive Topic Inspector) */}
        {activeBreadcrumbs.length > 0 && (
          <div className="absolute bottom-3 left-3 sm:left-4 z-30 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur-md border border-zinc-800/90 px-3 py-1.5 rounded-xl shadow-lg font-mono text-[10px] text-zinc-400 max-w-[85%] sm:max-w-[75%] overflow-x-auto no-scrollbar">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400 shrink-0 mr-1" />
            <span className="text-zinc-500 uppercase tracking-wider shrink-0">Ruta:</span>
            {activeBreadcrumbs.map((crumb, idx) => {
              const isLast = idx === activeBreadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id}>
                  {idx > 0 && <span className="text-zinc-600">/</span>}
                  <button
                    onClick={() => {
                      setActiveNodeId(crumb.id);
                      if (!expandedNodeIds.has(crumb.id) && crumb.childCount > 0) {
                        handleToggleExpand(crumb.id);
                      }
                    }}
                    className={cn(
                      "hover:underline transition-colors shrink-0 active:scale-95",
                      isLast ? "text-cyan-300 font-bold" : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {crumb.title}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
