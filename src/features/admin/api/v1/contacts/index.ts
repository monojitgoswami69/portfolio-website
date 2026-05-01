import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/features/admin/server/auth";
import { readContactFile, writeContactFile } from "@/lib/content/site-data";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contact } = await readContactFile();
    return NextResponse.json({ contact });
  } catch (error) {
    console.error("GET contacts error:", error);
    return NextResponse.json(
      { error: "Failed to read contact data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await writeContactFile(
      {
        email: String(body.email || "").trim(),
        socials: {
          github: String(body.socials?.github || "").trim(),
          linkedin: String(body.socials?.linkedin || "").trim(),
          twitter: String(body.socials?.twitter || "").trim(),
        },
      },
      `Update contact data by ${auth.username}`
    );

    revalidatePath("/");

    return NextResponse.json({
      contact: result.contact,
      commit: result.sync.commitSha,
    });
  } catch (error) {
    console.error("POST contacts error:", error);
    return NextResponse.json(
      { error: "Failed to save contact data" },
      { status: 500 }
    );
  }
}
