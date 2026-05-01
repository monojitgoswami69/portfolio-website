import { cookies } from "next/headers";
import { jwtVerify, SignJWT, type JWTPayload } from "jose";

export interface AuthUser {
  userId: string;
  username: string;
  role: string;
}

interface AuthTokenPayload extends JWTPayload {
  username: string;
  role: string;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
}

const JWT_SECRET = getJwtSecret();

export const AUTH_COOKIE_NAME = "auth_token";

export async function createAuthToken(
  user: AuthUser,
  expirationTime: string | number = "1h"
) {
  return new SignJWT({
    sub: user.userId,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as AuthTokenPayload;
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyAuthToken(token);

    return {
      userId: payload.sub || "",
      username: payload.username || "",
      role: payload.role || "assistant",
    };
  } catch {
    return null;
  }
}

export function getAuthCookieOptions(maxAge = 60 * 60) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
