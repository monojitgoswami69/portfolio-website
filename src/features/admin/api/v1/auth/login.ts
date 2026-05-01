import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, createAuthToken, getAuthCookieOptions } from "@/features/admin/server/auth";
import { logActivity } from "@/features/admin/server/activity";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberMe } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
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
