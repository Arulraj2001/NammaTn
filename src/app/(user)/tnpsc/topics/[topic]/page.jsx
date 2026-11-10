import React from 'react';
import { notFound } from 'next/navigation';
import { 
  TNPSC_TOPICS, 
  getTnpscTopicBySlugServer, 
  getTnpscQuestionsByTopicServer 
} from '@/lib/tnpscServer';
import TnpscPortalLayout from '@/components/tnpsc/TnpscPortalLayout';
import TnpscTopicPracticeView from '@/views/TnpscTopicPracticeView';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 86400; // ISR 24-hours cache with on-demand instant purge

export async function generateStaticParams() {
  return TNPSC_TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }) {
  const { topic: topicSlug } = await params;
  const topic = await getTnpscTopicBySlugServer(topicSlug);

  if (!topic) {
    return { title: 'TNPSC Topic Practice | VizhiTN' };
  }

  const title = topic.seo_title || `${topic.title_ta} | TNPSC Group 4 & Group 2 Samacheer Notes | VizhiTN`;
  const description = topic.seo_description || `${topic.title_ta} பற்றிய முழுமையான தேர்வு குறிப்புகள், முக்கிய வினாக்கள் மற்றும் அரசு சமச்சீர் கல்வி புத்தக ஆதாரங்கள்.`;

  return {
    title,
    description,
    keywords: topic.seo_keywords || ['tnpsc', topic.title_ta, 'samacheer kalvi notes'],
    alternates: {
      canonical: `/tnpsc/topics/${topic.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/tnpsc/topics/${topic.slug}`,
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

export default async function TopicPage({ params }) {
  const { topic: topicSlug } = await params;
  const topic = await getTnpscTopicBySlugServer(topicSlug);

  if (!topic) {
    notFound();
  }

  const questions = await getTnpscQuestionsByTopicServer(topicSlug);

  // Schema.org Quiz & FAQ structured data
  const quizSchema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: `${topic.title_ta} — TNPSC Practice Test`,
    description: topic.summary_overview_ta,
    educationalLevel: 'Competitive Examination',
    about: {
      '@type': 'Thing',
      name: topic.title_ta,
    },
    hasPart: (questions || []).map((q) => ({
      '@type': 'Question',
      name: q.question_ta,
      suggestedAnswer: (q.options || []).map((opt) => ({
        '@type': 'Answer',
        text: opt.text,
      })),
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.options?.find((o) => o.key === q.correct_key)?.text || '',
        comment: {
          '@type': 'Comment',
          text: q.explanation_ta || '',
        },
      },
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (topic.key_facts_bullet_points || []).slice(0, 5).map((point, i) => ({
      '@type': 'Question',
      name: `${topic.title_ta} முக்கிய தேர்வு குறிப்பு ${i + 1}`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: point,
      },
    })),
  };

  return (
    <TnpscPortalLayout activeTab="topics" currentSubject={topic.subject_slug}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Breadcrumbs
        items={[
          { name: 'TNPSC Portal', href: '/tnpsc' },
          { name: 'Topics', href: '/tnpsc/topics/vallinam-migum-idangal' },
          { name: topic.title_ta, href: `/tnpsc/topics/${topic.slug}` },
        ]}
      />
      <TnpscTopicPracticeView topic={topic} questions={questions} />
    </TnpscPortalLayout>
  );
}

