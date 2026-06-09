import {
  isGitHubSyncConfigured,
  syncFilesToGitHub,
  syncJsonFileToGitHub,
} from "@/features/admin/server/github-sync";
import { normalizeProjects, normalizeSiteContact } from "@/lib/content/site-data";
import type { SiteContact, SiteContactFile, SiteProject } from "@/lib/content/site-data";

const GITHUB_PROJECTS_FILE = process.env.GITHUB_PROJECTS_FILE || "src/data/projects.json";
const GITHUB_CONTACT_FILE = process.env.GITHUB_CONTACT_FILE || "src/data/contact.json";

export async function writeProjectsFile(
  projects: SiteProject[],
  message = "update via admin"
) {
  const normalizedProjects = normalizeProjects(projects);
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

export async function writeProjectsFileWithAssets({
  projects,
  assets,
  message = "update via admin",
}: {
  projects: SiteProject[];
  assets: { path: string; content: Buffer }[];
  message?: string;
}) {
  const normalizedProjects = normalizeProjects(projects);
  const serialized = `${JSON.stringify(normalizedProjects, null, 2)}\n`;
  if (!isGitHubSyncConfigured()) {
    throw new Error(
      "GitHub sync is required for project updates. Configure GITHUB_TOKEN and GITHUB_REPO."
    );
  }

  const sync = await syncFilesToGitHub({
    message,
    files: [
      ...assets,
      {
        path: GITHUB_PROJECTS_FILE,
        content: serialized,
      },
    ],
  });

  if (!sync.synced) {
    throw new Error(sync.reason || "GitHub sync failed for projects");
  }

  return {
    projects: normalizedProjects,
    sync,
  };
}

export async function writeContactFile(
  contact: SiteContact,
  message = "update via admin"
) {
  const normalizedContact: SiteContactFile = {
    contact: normalizeSiteContact(contact),
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
