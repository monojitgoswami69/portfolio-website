import { NextResponse } from "next/server";
import {
  ChatValidationError,
  enforceRateLimit,
  ensureBodySize,
  getChatHealth,
  getChatResponse,
  getClientIp,
  generateGuestId,
  incrementCounter,
  validateChatRequest,
} from "@/features/chat/server/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getChatHealth());
}

export async function POST(request: Request) {
  try {
    ensureBodySize(request);

    const clientIp = getClientIp(request);
    const userId = generateGuestId(clientIp);
    const rateLimit = await enforceRateLimit(clientIp);
    if (!rateLimit.ok) {
      return NextResponse.json(rateLimit.body, {
        status: rateLimit.status,
        headers: {
          ...rateLimit.headers,
          "X-User-ID": userId,
        },
      });
    }

    const payload = validateChatRequest(await request.json());
    const responseText = await getChatResponse(
      payload.message,
      payload.history || []
    );
    void incrementCounter();

    return NextResponse.json(
      {
        response: responseText,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          ...rateLimit.headers,
          "X-User-ID": userId,
        },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "PayloadTooLargeError") {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }

    if (error instanceof ChatValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    if (error instanceof Error && error.message.includes("Redis is required")) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error("POST /api/chat error:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
