export const SITE_URL = "https://mgbuilds.in";

export const SITE_NAME = "Monojit Goswami";

export const SITE_TAGLINE = "AI Backend Developer";

export const SITE_HEADLINE =
  "AI Backend Engineer specializing in production-grade RAG systems, agentic AI, and high-performance ML pipelines.";

export const SITE_DESCRIPTION =
  "Portfolio of Monojit Goswami, a self-taught Backend and AI Engineer specializing in production-grade RAG systems, agentic AI, and high-performance ML pipelines built with Python, FastAPI, and modern LLM stacks.";

export const SITE_TITLE_DEFAULT = `${SITE_NAME} - ${SITE_TAGLINE}`;
export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

export const SITE_OG_IMAGE = `${SITE_URL}/og_image/og-image.webp`;
export const SITE_OG_IMAGE_TYPE = "image/webp";
export const SITE_OG_IMAGE_WIDTH = 1200;
export const SITE_OG_IMAGE_HEIGHT = 630;
export const SITE_OG_IMAGE_ALT = `${SITE_NAME} - ${SITE_TAGLINE}`;

export const SOCIAL_PROFILES = {
  github: "https://github.com/monojitgoswami69",
  linkedin: "https://linkedin.com/in/monojitgoswami69",
  twitter: "https://twitter.com/monojitgoswami9",
};

export const TWITTER_HANDLE = "@monojitgoswami9";

export function absoluteUrl(path: string) {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
