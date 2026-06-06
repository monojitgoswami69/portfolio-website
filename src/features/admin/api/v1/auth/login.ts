import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { AUTH_COOKIE_NAME, createAuthToken, getAuthCookieOptions } from "@/features/admin/server/auth";
import { logActivity } from "@/features/admin/server/activity";
import { getClientIp } from "@/features/chat/server/server";
import { checkRateLimit } from "@/lib/server/rate-limit";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

const LOGIN_RATE_BUCKET = "admin-login";
const LOGIN_RATE_LIMIT = 5;
const LOGIN_RATE_WINDOW_SECONDS = 15 * 60;

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    // Still do a constant-time compare against a same-length buffer to avoid leaking length info
    const filler = Buffer.alloc(bufA.length);
    timingSafeEqual(bufA, filler);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

async function verifyPassword(submitted: string): Promise<boolean> {
  if (ADMIN_PASSWORD_HASH) {
    return bcrypt.compare(submitted, ADMIN_PASSWORD_HASH);
  }
  if (ADMIN_PASSWORD) {
    return timingSafeStringEqual(submitted, ADMIN_PASSWORD);
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit({
      bucket: LOGIN_RATE_BUCKET,
      subject: ip,
      limit: LOGIN_RATE_LIMIT,
      windowSeconds: LOGIN_RATE_WINDOW_SECONDS,
    });

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
          },
        }
      );
    }

    const { username, password, rememberMe } = await request.json();

    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (!ADMIN_USERNAME || (!ADMIN_PASSWORD && !ADMIN_PASSWORD_HASH)) {
      return NextResponse.json(
        { error: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    const usernameMatches = timingSafeStringEqual(username, ADMIN_USERNAME);
    const passwordMatches = await verifyPassword(password);

    if (!usernameMatches || !passwordMatches) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const authUser = {
      userId: ADMIN_USERNAME,
      username: ADMIN_USERNAME,
      role: "admin",
    };

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60;
    const token = await createAuthToken(authUser, rememberMe ? "30d" : "1h");
    const response = NextResponse.json({
      user: {
        userId: authUser.userId,
        username: authUser.username,
        role: authUser.role,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(maxAge));
    await logActivity(authUser.username, "login");

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
