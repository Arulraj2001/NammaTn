import { getRightBySlug, getAllRights } from "@/lib/awarenessServer";
import AwarenessRightDetail from "@/views/AwarenessRightDetail";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

const SITE_URL = "https://www.vizhitn.in";

export const revalidate = 3600;

export async function generateStaticParams() {
  const rights = getAllRights();
  return rights.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const right = getRightBySlug(resolvedParams.slug);
  if (!right) notFound();

  const title = right.seo_title_en || `${right.name_en} | Tamil Nadu Citizen Rights Guide`;
  const description = right.seo_desc_en || right.desc_en || `Statutory citizen legal rights guide under ${right.name_en} in Tamil Nadu.`;
  // Canonical points to primary URL /rights/[slug] to avoid duplicate content
  const canonical = `${SITE_URL}/rights/${right.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
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
          { name: "Awareness", href: "/awareness" },
          { name: "Citizen Rights", href: "/rights" },
          { name: right.name_en, href: `/rights/${right.slug}` },
        ]}
      />
      <AwarenessRightDetail right={right} />
    </>
  );
}
