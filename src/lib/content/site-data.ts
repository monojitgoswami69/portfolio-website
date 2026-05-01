import { promises as fs } from "fs";
import path from "path";
import { isGitHubSyncConfigured, syncJsonFileToGitHub } from "@/features/admin/server/github-sync";

export interface SiteContact {
  email: string;
  socials: {
    github: string;
    linkedin: string;
    twitter: string;
  };
}

export interface SiteContactFile {
  contact: SiteContact;
}

export interface SiteProject {
  id?: string;
  name: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  imageUrl: string;
  githubUrl?: string;
  demoUrl?: string;
  status?: string;
  features?: string[];
  category?: string;
  featured?: boolean;
  visible?: boolean;
  challenges?: string;
  learnings?: string;
  rank?: number;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const CONTACT_FILE = path.join(DATA_DIR, "contact.json");

const GITHUB_PROJECTS_FILE = process.env.GITHUB_PROJECTS_FILE || "src/data/projects.json";
const GITHUB_CONTACT_FILE = process.env.GITHUB_CONTACT_FILE || "src/data/contact.json";

function normalizeSocialValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProject(project: SiteProject, index: number): SiteProject {
  return {
    ...project,
    id: project.id || `${slugify(project.name || `project-${index + 1}`)}-${index + 1}`,
    techStack: Array.isArray(project.techStack) ? project.techStack : [],
    features: Array.isArray(project.features) ? project.features : [],
    visible: project.visible !== false,
    featured: project.featured === true,
    rank:
      typeof project.rank === "number" && Number.isFinite(project.rank)
        ? project.rank
        : 999 - index,
  };
}

export async function readProjectsFile() {
  const content = await fs.readFile(PROJECTS_FILE, "utf8");
  const parsed = JSON.parse(content) as SiteProject[];
  return parsed.map(normalizeProject);
}

export async function writeProjectsFile(
  projects: SiteProject[],
  message = "Update projects data"
) {
  const normalizedProjects = projects.map(normalizeProject);
  const serialized = `${JSON.stringify(normalizedProjects, null, 2)}\n`;
  if (!isGitHubSyncConfigured()) {
    throw new Error(
      "GitHub sync is required for project updates. Configure GITHUB_TOKEN and GITHUB_REPO."
    );
  }

  const sync = await syncJsonFileToGitHub({
    path: GITHUB_PROJECTS_FILE,
    content: serialized,
    message,
  });

  if (!sync.synced) {
    throw new Error(sync.reason || "GitHub sync failed for projects");
  }

  return {
    projects: normalizedProjects,
    sync,
  };
}

export async function readContactFile() {
  const content = await fs.readFile(CONTACT_FILE, "utf8");
  const parsed = JSON.parse(content) as Partial<SiteContactFile> | SiteContact;
  const contact =
    parsed && typeof parsed === "object" && "contact" in parsed
      ? parsed.contact
      : (parsed as SiteContact);

  return {
    contact: {
      email: normalizeSocialValue(contact?.email),
      socials: {
        github: normalizeSocialValue(contact?.socials?.github),
        linkedin: normalizeSocialValue(contact?.socials?.linkedin),
        twitter: normalizeSocialValue(contact?.socials?.twitter),
      },
    },
  };
}

export async function writeContactFile(
  contact: SiteContact,
  message = "Update contact data"
) {
  const normalizedContact: SiteContactFile = {
    contact: {
      email: normalizeSocialValue(contact.email),
      socials: {
        github: normalizeSocialValue(contact.socials?.github),
        linkedin: normalizeSocialValue(contact.socials?.linkedin),
        twitter: normalizeSocialValue(contact.socials?.twitter),
      },
    },
  };

  const serialized = `${JSON.stringify(normalizedContact, null, 2)}\n`;
  if (!isGitHubSyncConfigured()) {
    throw new Error(
      "GitHub sync is required for contact updates. Configure GITHUB_TOKEN and GITHUB_REPO."
    );
  }

  const sync = await syncJsonFileToGitHub({
    path: GITHUB_CONTACT_FILE,
    content: serialized,
    message,
  });

  if (!sync.synced) {
    throw new Error(sync.reason || "GitHub sync failed for contacts");
  }

  return {
    contact: normalizedContact.contact,
    sync,
  };
}
