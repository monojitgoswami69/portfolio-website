import { initializeDatabase, isDatabaseConfigured } from "@/features/admin/server/db-utils";
import { activityLogs } from "@/features/admin/server/schema";

interface ActivityMeta {
  [key: string]: unknown;
}

export async function logActivity(
  actor: string,
  action: string,
  meta: ActivityMeta = {}
) {
  if (!isDatabaseConfigured()) {
    return;
  }

  try {
    const db = initializeDatabase();
    await db.insert(activityLogs).values({
      actor,
      action,
      meta,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
