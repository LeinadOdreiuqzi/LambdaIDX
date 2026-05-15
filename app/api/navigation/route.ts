import { NextResponse } from "next/server";
import { PageService } from "@/services/page-service";

export async function GET() {
  try {
    // Fetch the hierarchy tree for the public navigation
    const tree = await PageService.getHierarchyTree();
    return NextResponse.json(tree);
  } catch (error) {
    console.error("Error in navigation API:", error);
    return NextResponse.json({ error: "Failed to fetch navigation tree" }, { status: 500 });
  }
}
