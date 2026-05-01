import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/features/admin/server/auth";
import {
  readProjectsFile,
  type SiteProject,
  writeProjectsFile,
} from "@/lib/content/site-data";

function parseProjectPayload(body: Record<string, unknown>): SiteProject {
  const techStackInput = body.techStack;
  const featuresInput = body.features;

  const techStack = Array.isArray(techStackInput)
    ? techStackInput.map((item) => String(item).trim()).filter(Boolean)
    : String(techStackInput || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const features = Array.isArray(featuresInput)
    ? featuresInput.map((item) => String(item).trim()).filter(Boolean)
    : String(featuresInput || "")
        .split("\n")
        .map((item) => item.replace(/^-+\s*/, "").trim())
        .filter(Boolean);

  return {
    id: String(body.id || "").trim() || undefined,
    name: String(body.name || "").trim(),
    description: String(body.description || "").trim(),
    longDescription: String(body.longDescription || "").trim(),
    status: String(body.status || "In Progress").trim(),
    category: String(body.category || "").trim(),
    techStack,
    features,
    imageUrl: String(body.imageUrl || "").trim(),
    githubUrl: String(body.githubUrl || "").trim(),
    demoUrl: String(body.demoUrl || "").trim(),
    challenges: String(body.challenges || "").trim(),
    learnings: String(body.learnings || "").trim(),
    visible: body.visible !== false,
    featured: body.featured === true,
    rank:
      typeof body.rank === "number" && Number.isFinite(body.rank)
        ? body.rank
        : 999,
  };
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await readProjectsFile();
    return NextResponse.json({
      projects,
    });
  } catch (error) {
    console.error("GET projects error:", error);
    return NextResponse.json(
      { error: "Failed to read project data" },
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
    const existingProjects = await readProjectsFile();
    const nextProject = parseProjectPayload(body);
    const result = await writeProjectsFile(
      [...existingProjects, nextProject],
      `Create project by ${auth.username}: ${nextProject.name || "untitled"}`
    );

    revalidatePath("/");

    return NextResponse.json({
      project:
        result.projects.find((project) => project.id === nextProject.id) ??
        result.projects[result.projects.length - 1],
      commit: result.sync.commitSha,
    });
  } catch (error) {
    console.error("POST projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const projectId = String(body.id || "").trim();

    if (!projectId) {
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    }

    const existingProjects = await readProjectsFile();
    const nextProject = parseProjectPayload(body);
    const projectIndex = existingProjects.findIndex(
      (project) => project.id === projectId
    );

    if (projectIndex === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updatedProjects = [...existingProjects];
    updatedProjects[projectIndex] = {
      ...updatedProjects[projectIndex],
      ...nextProject,
      id: projectId,
    };

    const result = await writeProjectsFile(
      updatedProjects,
      `Update project by ${auth.username}: ${updatedProjects[projectIndex].name}`
    );

    revalidatePath("/");

    return NextResponse.json({
      project: result.projects.find((project) => project.id === projectId),
      commit: result.sync.commitSha,
    });
  } catch (error) {
    console.error("PUT projects error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const existingProjects = await readProjectsFile();
    const projectToDelete = existingProjects.find((project) => project.id === id);

    if (!projectToDelete) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const result = await writeProjectsFile(
      existingProjects.filter((project) => project.id !== id),
      `Delete project by ${auth.username}: ${projectToDelete.name}`
    );

    revalidatePath("/");

    return NextResponse.json({
      commit: result.sync.commitSha,
    });
  } catch (error) {
    console.error("DELETE projects error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 400 }
    );
  }
}
