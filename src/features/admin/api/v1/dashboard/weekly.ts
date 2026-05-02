import { NextResponse } from "next/server";
import { and, gte, lte } from "drizzle-orm";
import { getAuthenticatedUser } from "@/features/admin/server/auth";
import { initializeDatabase, isDatabaseConfigured } from "@/features/admin/server/db-utils";
import { weeklyMetrics } from "@/features/admin/server/schema";

function isoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6);

  if (!isDatabaseConfigured()) {
    const weekly = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);

      weekly.push({
        date: isoDate(date),
        queries: 0,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }

    return NextResponse.json({
      weekly,
      message: "Dashboard data is not available until the database is configured.",
    });
  }

  try {
    const db = initializeDatabase();
    const rows = await db
      .select()
      .from(weeklyMetrics)
      .where(
        and(
          gte(weeklyMetrics.date, isoDate(startDate)),
          lte(weeklyMetrics.date, isoDate(today))
        )
      );

    const byDate = new Map(rows.map((row) => [row.date, row]));
    const weekly = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const key = isoDate(date);
      const match = byDate.get(key);

      weekly.push({
        date: key,
        queries: match?.queries ?? 0,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }

    return NextResponse.json({ weekly });
  } catch (error) {
    console.error("Weekly stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly stats" },
      { status: 500 }
    );
  }
}
