import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/features/admin/server/auth";
import { logActivity } from "@/features/admin/server/activity";
import { initializeDatabase, isDatabaseConfigured } from "@/features/admin/server/db-utils";
import { communications } from "@/features/admin/server/schema";

const ALLOWED_STATUSES = ["new", "done", "dismissed"];

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured for communication updates yet." },
      { status: 503 }
    );
  }

  const { id } = await context.params;

  try {
    const db = initializeDatabase();
    const body = await request.json();

    const status = body.status;
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await db
      .update(communications)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(communications.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    await logActivity(auth.username, "communication_updated", {
      submissionId: id,
      status: updated[0].status,
    });

    return NextResponse.json({ submission: updated[0] });
  } catch (error) {
    console.error("PATCH communications error:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured for communication deletion yet." },
      { status: 503 }
    );
  }

  const { id } = await context.params;

  try {
    const db = initializeDatabase();
    const deleted = await db
      .delete(communications)
      .where(eq(communications.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    await logActivity(auth.username, "communication_deleted", {
      submissionId: id,
      email: deleted[0].email,
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE communications error:", error);
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 500 }
    );
  }
}
