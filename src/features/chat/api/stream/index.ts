import { NextResponse } from "next/server";
import {
  ChatValidationError,
  enforceRateLimit,
  ensureBodySize,
  getClientIp,
  generateGuestId,
  incrementCounter,
  streamChatResponse,
  validateChatRequest,
} from "@/features/chat/server/server";

export const runtime = "nodejs";

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
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChatResponse(
            payload.message,
            payload.history || []
          )) {
            const lines = chunk.split("\n");
            const encoded = lines.map((line) => `data: ${line}`).join("\n") + "\n\n";
            controller.enqueue(encoder.encode(encoded));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          void incrementCounter();
          controller.close();
        } catch (error) {
          console.error("POST /api/chat/stream error:", error);
          controller.enqueue(
            encoder.encode("data: **Error:** An error occurred processing your request\n\n")
          );
          controller.enqueue(encoder.encode("data: [ERROR]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        ...rateLimit.headers,
        "X-User-ID": userId,
      },
    });
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

    console.error("POST /api/chat/stream error:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
