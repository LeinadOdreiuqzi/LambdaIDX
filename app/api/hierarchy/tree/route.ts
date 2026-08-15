import { NextResponse } from "next/server";
import { PageService } from "@/services/page-service";
import { CacheService } from "@/services/cache-service";
import { NavPage } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get("nodeId");

    const cacheKey = nodeId
      ? `hierarchy:tree:branch:${nodeId}`
      : "hierarchy:tree:full";

    // 1. Check Redis Cache for sub-5ms response
    const cachedTree = await CacheService.get<NavPage[]>(cacheKey);
    if (cachedTree) {
      return NextResponse.json({
        success: true,
        source: "cache",
        tree: cachedTree,
      });
    }

    // 2. Fetch full hierarchy from DB / PageService
    const fullTree = await PageService.getHierarchyTree();

    let resultTree = fullTree;

    // Filter by branch if nodeId parameter is supplied
    if (nodeId && nodeId !== "all") {
      const findBranch = (nodes: NavPage[]): NavPage | null => {
        for (const n of nodes) {
          if (n.id === nodeId || n.slug === nodeId) return n;
          if (n.children && n.children.length > 0) {
            const match = findBranch(n.children);
            if (match) return match;
          }
        }
        return null;
      };

      const matchedBranch = findBranch(fullTree);
      resultTree = matchedBranch ? [matchedBranch] : fullTree;
    }

    // Cache the result for 5 minutes (300 seconds)
    await CacheService.set(cacheKey, resultTree, 300);

    return NextResponse.json({
      success: true,
      source: "database",
      tree: resultTree,
    });
  } catch (error) {
    console.error("Failed to fetch hierarchy tree API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
