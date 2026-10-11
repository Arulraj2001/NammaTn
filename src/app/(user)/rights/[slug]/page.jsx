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
  const canonical = `${SITE_URL}/rights/${right.slug}`;

  return {
    title,
    description,
    keywords: [
      right.name_en,
      right.name_ta,
      right.statutory_section_en,
      "citizen rights tamil nadu",
      "statutory protections",
      "tamil nadu legal self defense",
      right.department_en,
    ].filter(Boolean),
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "VizhiTN",
      locale: "en_IN",
      images: right.image_url
        ? [{ url: `${SITE_URL}${right.image_url}`, width: 1200, height: 630, alt: right.name_en }]
        : [{ url: `${SITE_URL}/images/evergreen/rti-rights.jpg`, width: 1200, height: 630, alt: right.name_en }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: right.image_url ? [`${SITE_URL}${right.image_url}`] : [`${SITE_URL}/images/evergreen/rti-rights.jpg`],
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const right = getRightBySlug(resolvedParams.slug);
  if (!right) notFound();

  const canonicalUrl = `${SITE_URL}/rights/${right.slug}`;

  // 1. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Citizen Rights",
        item: `${SITE_URL}/rights`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: right.name_en,
        item: canonicalUrl,
      },
    ],
  };

  // 2. Article / Legal Service Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: right.seo_title_en || right.name_en,
    description: right.seo_desc_en || right.desc_en,
    image: right.image_url ? `${SITE_URL}${right.image_url}` : `${SITE_URL}/images/evergreen/rti-rights.jpg`,
    author: {
      "@type": "Organization",
      name: "VizhiTN Legal Transparency Desk",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "VizhiTN",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    inLanguage: ["en", "ta"],
    about: {
      "@type": "GovernmentService",
      name: right.name_en,
      serviceType: "Citizen Legal Rights & Protection",
      provider: {
        "@type": "GovernmentOrganization",
        name: right.department_en,
      },
    },
  };

  // 3. FAQPage Schema (Triggers Rich Snippet Accordions in Google SERP)
  const faqSchema = right.faqs && right.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: right.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q_en,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a_en,
      },
    })),
  } : null;

  // 4. HowTo Schema (Step-by-step enforcement procedure)
  const howToSchema = right.steps_en && right.steps_en.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to enforce ${right.name_en} in Tamil Nadu`,
    description: `Step-by-step citizen legal procedure to exercise rights under ${right.statutory_section_en || right.name_en}.`,
    step: right.steps_en.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: `Step ${idx + 1}`,
      text: step,
    })),
  } : null;

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Citizen Rights", href: "/rights" },
          { name: right.name_en, href: `/rights/${right.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      <AwarenessRightDetail right={right} />
    </>
  );
}
