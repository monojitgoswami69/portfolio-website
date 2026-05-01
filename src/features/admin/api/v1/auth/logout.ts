import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getAuthenticatedUser, getAuthCookieOptions } from "@/features/admin/server/auth";
import { logActivity } from "@/features/admin/server/activity";

export async function POST() {
  const user = await getAuthenticatedUser();

  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });

  if (user) {
    await logActivity(user.username, "logout");
  }

  return response;
}
