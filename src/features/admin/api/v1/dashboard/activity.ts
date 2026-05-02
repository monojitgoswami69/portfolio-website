import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getAuthenticatedUser } from "@/features/admin/server/auth";
import { initializeDatabase, isDatabaseConfigured } from "@/features/admin/server/db-utils";
import { activityLogs } from "@/features/admin/server/schema";

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") || "20");
  const limit = Number.isFinite(limitParam)
    ? Math.max(1, Math.min(limitParam, 100))
    : 20;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      activity: [],
      message: "Dashboard data is not available until the database is configured.",
    });
  }

  try {
    const db = initializeDatabase();
    const activity = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);

    return NextResponse.json({
      activity: activity.map((entry) => ({
        id: entry.id,
        action: entry.action,
        actor: entry.actor,
        timestamp: entry.timestamp,
        meta: entry.meta ?? {},
      })),
    });
  } catch (error) {
    console.error("Activity log error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity log" },
      { status: 500 }
    );
  }
}
