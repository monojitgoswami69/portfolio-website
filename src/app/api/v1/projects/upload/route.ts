import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { getAuthenticatedUser } from "@/features/admin/server/auth";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function slugify(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported type: ${file.type}. Allowed: PNG, JPEG, WebP, GIF, SVG` },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 5 MB limit" },
        { status: 400 },
      );
    }

    const ext = file.name.includes(".")
      ? `.${file.name.split(".").pop()?.toLowerCase()}`
      : ".png";
    const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "project";
    const uniqueName = `${base}-${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const dir = join(process.cwd(), "public", "assets", "projects");
    await mkdir(dir, { recursive: true });

    await writeFile(join(dir, uniqueName), buffer);

    const url = `/assets/projects/${uniqueName}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
