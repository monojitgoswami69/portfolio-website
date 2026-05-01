import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "auth_token";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin dashboard routes and admin API routes (except auth endpoints)
  const isAdminPage = pathname.startsWith("/admin/dashboard");
  const isAdminApi =
    pathname.startsWith("/api/v1/") &&
    !pathname.startsWith("/api/v1/auth/") &&
    !pathname.startsWith("/api/v1/chat");

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
