import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/features/admin/server/auth";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      userId: user.userId,
      username: user.username,
      role: user.role,
    },
  });
}
