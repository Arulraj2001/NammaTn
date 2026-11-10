import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { TNPSC_SUBJECTS, getSubjectBySlug, getTnpscQuestionsServer } from '@/lib/tnpscServer';
import TnpscSubjectView from '@/views/TnpscSubjectView';
import TnpscPortalLayout from '@/components/tnpsc/TnpscPortalLayout';

export const revalidate = 86400; // 24-hour ISR

export async function generateStaticParams() {
  return TNPSC_SUBJECTS.filter((s) => s.slug !== 'all').map((s) => ({
    subject: s.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { subject: subjectParam } = await params;
  const sub = getSubjectBySlug(subjectParam);
  if (!sub || sub.slug === 'all') return notFound();

  const title = `TNPSC ${sub.name_ta} (${sub.name_en}) மாதிரி வினாக்கள் 2026 | சமச்சீர் குறிப்புகள் - VizhiTN`;
  const description = `TNPSC Group 4 & Group 2 தேர்வுகளுக்கான ${sub.name_ta} மாதிரி வினாக்கள். சமச்சீர் கல்வி புத்தகப் பக்க எண்கள் மற்றும் முந்தைய ஆண்டு வினாத்தாள் (PYQ) விளக்கங்களுடன் இலவசமாக பயிற்சி செய்யுங்கள்.`;
  const canonical = `/tnpsc/${sub.slug}`;

  return {
    title,
    description,
    keywords: [
      `tnpsc ${sub.name_en.toLowerCase()} questions`,
      `tnpsc ${sub.name_ta} மாதிரி வினாக்கள்`,
      'samacheer kalvi one mark questions',
      'tnpsc group 4 preparation 2026',
      'vizhitn tnpsc',
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

export default async function SubjectPage({ params }) {
  const { subject: subjectParam } = await params;
  const sub = getSubjectBySlug(subjectParam);
  if (!sub || sub.slug === 'all') notFound();

  const questions = await getTnpscQuestionsServer(sub.slug);

  // Construct Google Quiz Schema (JSON-LD)
  const quizSchema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: `TNPSC ${sub.name_ta} (${sub.name_en}) தினசரி மாதிரி வினாடி வினா`,
    description: `TNPSC Group 4, Group 2, மற்றும் SI தேர்வுகளுக்கான ${sub.name_ta} ஒரு மதிப்பெண் மாதிரி வினாக்கள்`,
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

  return (
    <TnpscPortalLayout activeTab="topics" currentSubject={sub.slug}>
      {/* Google Educational Quiz Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />

      <Breadcrumbs
        items={[
          { name: 'TNPSC Portal', href: '/tnpsc' },
          { name: `${sub.icon} ${sub.name_ta}`, href: `/tnpsc/${sub.slug}` },
        ]}
      />

      <TnpscSubjectView subject={sub} initialQuestions={questions} />
    </TnpscPortalLayout>
  );
}

