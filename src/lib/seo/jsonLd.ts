import type { SiteContact, SiteProject } from "@/lib/content/site-data";
import {
  SITE_DESCRIPTION,
  SITE_HEADLINE,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_URL,
  SOCIAL_PROFILES,
  absoluteUrl,
} from "./site";

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PROFILE_PAGE_ID = `${SITE_URL}/#profile`;

interface BuildGraphArgs {
  projects: SiteProject[];
  contact: SiteContact;
}

function projectId(project: SiteProject) {
  return `${SITE_URL}/#project-${project.id ?? project.name}`;
}

function buildPerson(contact: SiteContact) {
  const sameAs = [
    contact.socials?.github || SOCIAL_PROFILES.github,
    contact.socials?.linkedin || SOCIAL_PROFILES.linkedin,
    contact.socials?.twitter || SOCIAL_PROFILES.twitter,
  ].filter(Boolean);

  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_NAME,
    alternateName: "monojitgoswami69",
    url: SITE_URL,
    image: absoluteUrl("/assets/profile.webp"),
    jobTitle: "Backend & AI Engineer",
    description: SITE_HEADLINE,
    email: contact.email ? `mailto:${contact.email}` : undefined,
    sameAs,
    knowsAbout: [
      "Retrieval-Augmented Generation",
      "Agentic AI",
      "Large Language Models",
      "Backend Engineering",
      "Python",
      "FastAPI",
      "Vector Databases",
      "Machine Learning Pipelines",
      "React",
      "Next.js",
    ],
  };
}

function buildWebsite() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: `${SITE_NAME} — Portfolio`,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
  };
}

function buildProfilePage(projects: SiteProject[]) {
  return {
    "@type": "ProfilePage",
    "@id": PROFILE_PAGE_ID,
    url: SITE_URL,
    name: `${SITE_NAME} | Portfolio`,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    primaryImageOfPage: SITE_OG_IMAGE,
    mainEntity: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
    hasPart: projects
      .filter((project) => project.visible !== false)
      .map((project) => ({ "@id": projectId(project) })),
  };
}

function buildSoftwareApplications(projects: SiteProject[]) {
  return projects
    .filter((project) => project.visible !== false)
    .map((project) => {
      const node: Record<string, unknown> = {
        "@type": "SoftwareApplication",
        "@id": projectId(project),
        name: project.name,
        description: project.longDescription || project.description,
        applicationCategory: project.category || "WebApplication",
        operatingSystem: "Web",
        image: absoluteUrl(project.imageUrl),
        author: { "@id": PERSON_ID },
        creator: { "@id": PERSON_ID },
        keywords: project.techStack?.join(", "),
      };

      if (project.demoUrl) node.url = project.demoUrl;
      if (project.githubUrl) node.codeRepository = project.githubUrl;
      if (project.featured) node.award = "Featured Project";

      const offers = project.demoUrl
        ? {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          }
        : undefined;
      if (offers) node.offers = offers;

      return node;
    });
}

export function buildSiteJsonLd({ projects, contact }: BuildGraphArgs) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildPerson(contact),
      buildWebsite(),
      buildProfilePage(projects),
      ...buildSoftwareApplications(projects),
    ],
  };
}
