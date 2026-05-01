interface GitHubSyncTarget {
  path: string;
  content: string;
  message: string;
}

const GITHUB_API_BASE = "https://api.github.com";

function getGitHubConfig() {
  return {
    token: process.env.GITHUB_TOKEN ?? "",
    repo: process.env.GITHUB_REPO ?? "",
    branch: process.env.GITHUB_BRANCH ?? "main",
  };
}

export function isGitHubSyncConfigured() {
  const { token, repo } = getGitHubConfig();
  return Boolean(token && repo);
}

async function githubRequest(
  method: "GET" | "PUT",
  path: string,
  body?: Record<string, unknown>
) {
  const { token, repo, branch } = getGitHubConfig();

  if (!token || !repo) {
    throw new Error("GitHub sync is not configured");
  }

  const url = new URL(
    `${GITHUB_API_BASE}/repos/${repo}/contents/${path}`
  );

  if (method === "GET" && branch) {
    url.searchParams.set("ref", branch);
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body
      ? JSON.stringify({
          ...body,
          ...(method === "PUT" && branch ? { branch } : {}),
        })
      : undefined,
    cache: "no-store",
  });

  if (response.status === 404 && method === "GET") {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GitHub sync failed (${response.status}): ${errorText || response.statusText}`
    );
  }

  return response.json();
}

async function getGitHubFileSha(path: string) {
  const result = await githubRequest("GET", path);
  if (!result || typeof result !== "object" || !("sha" in result)) {
    return null;
  }
  return String(result.sha);
}

export async function getGitHubTextFile(path: string) {
  if (!isGitHubSyncConfigured()) {
    return {
      content: null,
      sha: null,
    };
  }

  const result = await githubRequest("GET", path);
  if (!result || typeof result !== "object") {
    return {
      content: null,
      sha: null,
    };
  }

  const encodedContent =
    "content" in result ? String(result.content ?? "") : "";
  const normalizedContent = encodedContent.replace(/\n/g, "");

  return {
    content: normalizedContent
      ? Buffer.from(normalizedContent, "base64").toString("utf8")
      : null,
    sha: "sha" in result ? String(result.sha ?? "") : null,
  };
}

export async function syncJsonFileToGitHub({
  path,
  content,
  message,
}: GitHubSyncTarget) {
  if (!isGitHubSyncConfigured()) {
    return {
      synced: false,
      commitSha: null,
      reason: "GitHub sync is not configured",
    };
  }

  try {
    const sha = await getGitHubFileSha(path);
    const result = await githubRequest("PUT", path, {
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      ...(sha ? { sha } : {}),
    });

    const commitSha =
      result && typeof result === "object" && "commit" in result
        ? String((result.commit as { sha?: string }).sha ?? "")
        : "";

    return {
      synced: true,
      commitSha: commitSha ? commitSha.slice(0, 7) : null,
      reason: null,
    };
  } catch (error) {
    return {
      synced: false,
      commitSha: null,
      reason: error instanceof Error ? error.message : "GitHub sync failed",
    };
  }
}
