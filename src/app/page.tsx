import HomePage from "@/features/home/HomePage";
import { readContactFile, readProjectsFile } from "@/lib/content/site-data";
import { JsonLd } from "@/lib/seo/JsonLd";
import { buildSiteJsonLd } from "@/lib/seo/jsonLd";

export const revalidate = 60;

export default async function Page() {
  const [projects, contactResult] = await Promise.all([
    readProjectsFile(),
    readContactFile(),
  ]);

  const jsonLd = buildSiteJsonLd({
    projects,
    contact: contactResult.contact,
  });

  return (
    <>
      <JsonLd data={jsonLd} id="site-json-ld" />
      <HomePage projects={projects} contact={contactResult.contact} />
    </>
  );
}
