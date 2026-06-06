import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { isSameOriginRequest } from "@/lib/server/csrf";

const AUTH_COOKIE_NAME = "auth_token";
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin dashboard routes and admin API routes (except auth, chat, and public contact submission)
  const isAdminPage = pathname.startsWith("/admin/dashboard");
  const isApiV1 = pathname.startsWith("/api/v1/");
  const isAdminApi =
    isApiV1 &&
    !pathname.startsWith("/api/v1/auth/") &&
    !pathname.startsWith("/api/v1/chat") &&
    pathname !== "/api/v1/communication";

  // CSRF: require same-origin signal on every mutating /api/v1/* request,
  // including the public contact form (POST /api/v1/communication) and
  // /api/v1/auth/login. Bypass: same-origin GET/HEAD reads.
  if (isApiV1 && MUTATING_METHODS.has(request.method)) {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Cross-site request blocked" },
        { status: 403 }
      );
    }
  }

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = getJwtSecret();

  if (!token || !secret) {
    if (isAdminPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (isAdminPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/api/v1/:path*"],
};
