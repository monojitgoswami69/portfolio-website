import { NextResponse } from "next/server";
import { getClientIp, getRateLimitSnapshot } from "@/features/chat/server/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const snapshot = await getRateLimitSnapshot(getClientIp(request));

    return NextResponse.json(
      {
        user_id: snapshot.userId,
        user_requests_left: snapshot.userRequestsLeft,
        global_requests_left: snapshot.globalRequestsLeft,
        reset_at: snapshot.resetAt,
      },
      {
        headers: {
          "X-User-ID": snapshot.userId,
          "Access-Control-Expose-Headers": "X-User-ID",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("Redis is required")) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error("GET /api/chat/initialize error:", error);
    return NextResponse.json(
      { error: "An error occurred during initialization" },
      { status: 500 }
    );
  }
}
