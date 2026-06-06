import { NextResponse } from "next/server";
import { desc, eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/features/admin/server/auth";
import { logActivity } from "@/features/admin/server/activity";
import { initializeDatabase, isDatabaseConfigured } from "@/features/admin/server/db-utils";
import { communications } from "@/features/admin/server/schema";
import { getClientIp } from "@/features/chat/server/server";
import { checkRateLimit } from "@/lib/server/rate-limit";

const ALLOWED_STATUSES = new Set(["new", "done", "dismissed"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUBMIT_BUCKET = "contact-form";
const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_SECONDS = 60 * 60;

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      records: [],
      count: 0,
      message: "Communication records are not available until the database is configured.",
    });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const db = initializeDatabase();
    const filters = [];

    if (status && ALLOWED_STATUSES.has(status)) {
      filters.push(eq(communications.status, status));
    }

    const records = await db
      .select()
      .from(communications)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(desc(communications.createdAt));

    return NextResponse.json({
      records,
      count: records.length,
    });
  } catch (error) {
    console.error("GET communications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch communication records" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit({
      bucket: SUBMIT_BUCKET,
      subject: ip,
      limit: SUBMIT_LIMIT,
      windowSeconds: SUBMIT_WINDOW_SECONDS,
    });
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
      return NextResponse.json(
        { error: "You've submitted too many messages. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "Database is not configured for communication submissions yet." },
        { status: 503 }
      );
    }

    const db = initializeDatabase();
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long." },
        { status: 400 }
      );
    }

    const created = await db
      .insert(communications)
      .values({
        name,
        email,
        message,
        status: "new",
      })
      .returning();

    await logActivity("Public Form", "communication_received", {
      submissionId: created[0].id,
      email: created[0].email,
    });

    return NextResponse.json({
      message: "Your message has been received!",
      submission: created[0],
    });
  } catch (error) {
    console.error("POST communications error:", error);
    return NextResponse.json(
      { error: "Failed to submit message" },
      { status: 500 }
    );
  }
}
