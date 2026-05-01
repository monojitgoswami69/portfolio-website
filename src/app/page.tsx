import HomePage from "@/features/home/HomePage";
import { readContactFile, readProjectsFile } from "@/lib/content/site-data";

export const revalidate = 60;

export default async function Page() {
  const [projects, contactResult] = await Promise.all([
    readProjectsFile(),
    readContactFile(),
  ]);

  return <HomePage projects={projects} contact={contactResult.contact} />;
}
