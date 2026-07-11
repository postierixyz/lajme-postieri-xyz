import { NextRequest, NextResponse } from "next/server";
import { ingestAllFeeds, cleanupOldArticles } from "@/lib/rss-parser";

export const maxDuration = 300; // 5 minutes
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  const url = new URL(request.url);
  const token = url.searchParams.get("secret");

  if (secret && authHeader !== `Bearer ${secret}` && token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await ingestAllFeeds();
    const cleaned = await cleanupOldArticles();

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...result,
      articlesCleanedUp: cleaned,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
