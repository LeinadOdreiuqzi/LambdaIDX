import { NextResponse } from "next/server";

export async function GET() {
  // Simple health probe – returns status 200 if the app is running.
  // Could be extended to check DB connectivity, cache, etc.
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
