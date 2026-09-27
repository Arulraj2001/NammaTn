import { getRightBySlug, getAllRights } from "@/lib/awarenessServer";
import AwarenessRightDetail from "@/views/AwarenessRightDetail";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

const SITE_URL = "https://www.vizhitn.in";

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const right = getRightBySlug(resolvedParams.slug);
  if (!right) notFound();

  const title = right.name_en;
  const description = right.desc_en || `Learn about statutory citizen rights under ${title} in Tamil Nadu.`;
  const canonical = `${SITE_URL}/rights/${right.slug}`;

  return {
    title: `${title} - Citizen Rights Guide | VizhiTN`,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | VizhiTN`,
      description,
      url: canonical,
      type: "article",
      images: right.image_url
        ? [{ url: `${SITE_URL}${right.image_url}`, width: 1200, height: 630, alt: title }]
        : undefined,
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const right = getRightBySlug(resolvedParams.slug);
  if (!right) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Citizen Rights", href: "/rights" },
          { name: right.name_en, href: `/rights/${right.slug}` },
        ]}
      />
      <AwarenessRightDetail right={right} />
    </>
  );
}
