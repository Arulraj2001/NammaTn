import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { 
  TNPSC_PYQ_PAPERS, 
  getTnpscPyqPaperBySlugServer, 
  getTnpscQuestionsByPyqPaperServer 
} from '@/lib/tnpscServer';
import TnpscPortalLayout from '@/components/tnpsc/TnpscPortalLayout';
import TnpscSubjectView from '@/views/TnpscSubjectView';

export const revalidate = 86400; // 24-hour ISR cache

export async function generateStaticParams() {
  return TNPSC_PYQ_PAPERS.map((p) => ({
    paper: p.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { paper: paperSlug } = await params;
  const paper = await getTnpscPyqPaperBySlugServer(paperSlug);
  if (!paper) return notFound();

  const title = `TNPSC ${paper.year} ${paper.title_ta} Solved Question Paper & Key | Samacheer Kalvi Notes - VizhiTN`;
  const description = `Practice official TNPSC ${paper.year} ${paper.title_ta} (${paper.title_en}) question paper online with verified answer keys, Samacheer Kalvi book citations, and 20s speed timer.`;
  const canonical = `/tnpsc/pyq/${paper.slug}`;

  return {
    title,
    description,
    keywords: [
      `tnpsc ${paper.year} question paper with answers`,
      `tnpsc ${paper.title_en.toLowerCase()} solved paper`,
      `tnpsc pyq official answer key`,
      'samacheer kalvi one mark notes',
      'vizhitn tnpsc'
    ],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'VizhiTN',
      locale: 'ta_IN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PyqPaperPage({ params }) {
  const { paper: paperSlug } = await params;
  const paper = await getTnpscPyqPaperBySlugServer(paperSlug);
  if (!paper) notFound();

  const questions = await getTnpscQuestionsByPyqPaperServer(paper.slug);

  // Google Quiz JSON-LD Schema
  const quizSchema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: `TNPSC ${paper.year} ${paper.title_ta} Solved Question Paper`,
    description: `Official solved paper with Samacheer Kalvi citations: ${paper.title_en}`,
    educationalLevel: 'Competitive Exam',
    hasPart: questions.slice(0, 10).map((q) => ({
      '@type': 'Question',
      name: q.question_ta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.options?.find((o) => o.key === q.correct_key)?.text || q.correct_key,
      },
      suggestedAnswer: q.options?.map((o) => ({
        '@type': 'Answer',
        text: o.text,
      })),
    })),
  };

  // Pseudo subject object for view rendering
  const pseudoSubject = {
    slug: paper.slug,
    name_ta: `${paper.year} ${paper.title_ta}`,
    name_en: paper.title_en,
    icon: '📄',
    color: 'bg-indigo-600',
  };

  return (
    <TnpscPortalLayout activeTab="pyq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />

      <Breadcrumbs
        items={[
          { name: 'TNPSC Portal', href: '/tnpsc' },
          { name: 'PYQ Papers', href: '/tnpsc/pyq' },
          { name: `${paper.year} Paper`, href: `/tnpsc/pyq/${paper.slug}` },
        ]}
      />

      <TnpscSubjectView subject={pseudoSubject} initialQuestions={questions} />
    </TnpscPortalLayout>
  );
}

