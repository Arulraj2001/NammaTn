import React from 'react';
import { notFound } from 'next/navigation';
import { 
  TNPSC_EXAMS, 
  getTnpscExamBySlugServer, 
  getTnpscSubjectsServer, 
  getTnpscPyqPapersServer,
  getTnpscTopicsServer
} from '@/lib/tnpscServer';
import TnpscPortalLayout from '@/components/tnpsc/TnpscPortalLayout';
import TnpscExamHubView from '@/views/TnpscExamHubView';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const revalidate = 86400; // 24-hour ISR

export async function generateStaticParams() {
  return TNPSC_EXAMS.map((e) => ({ exam: e.slug }));
}

export async function generateMetadata({ params }) {
  const { exam: examSlug } = await params;
  const exam = await getTnpscExamBySlugServer(examSlug);

  if (!exam) {
    return { title: 'TNPSC Exam Preparation Hub | VizhiTN' };
  }

  const title = `${exam.name_ta} (${exam.name_en}) Preparation Hub 2026 | VizhiTN`;
  const description = `${exam.name_ta} தேர்விற்கான முழுமையான பாடத்திட்டம், சமச்சீர் கல்வி குறிப்புகள், மாதிரித் தேர்வுகள் மற்றும் முந்தைய ஆண்டு வினாத்தாள்கள்.`;

  return {
    title,
    description,
    keywords: [exam.slug, exam.name_en, exam.name_ta, 'tnpsc exam preparation', 'samacheer kalvi notes'],
    alternates: { canonical: `/tnpsc/exams/${exam.slug}` },
    openGraph: {
      title,
      description,
      url: `/tnpsc/exams/${exam.slug}`,
      siteName: 'VizhiTN',
      locale: 'ta_IN',
      type: 'website',
    },
  };
}

export default async function ExamPage({ params }) {
  const { exam: examSlug } = await params;
  const exam = await getTnpscExamBySlugServer(examSlug);

  if (!exam) {
    notFound();
  }

  const [pyqPapers, topics, subjects] = await Promise.all([
    getTnpscPyqPapersServer(exam.slug),
    getTnpscTopicsServer({ examSlug: exam.slug }),
    getTnpscSubjectsServer(exam.slug),
  ]);

  const examSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: exam.name_en,
    alternateName: exam.name_ta,
    description: exam.description_ta,
    credentialCategory: 'Competitive Examination',
    recognizedBy: {
      '@type': 'State',
      name: 'Tamil Nadu',
    },
  };

  return (
    <TnpscPortalLayout activeTab="exams" currentExam={exam.slug}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(examSchema) }}
      />
      <Breadcrumbs
        items={[
          { name: 'TNPSC Portal', href: '/tnpsc' },
          { name: 'Exams', href: '/tnpsc/exams/group-4' },
          { name: exam.name_ta, href: `/tnpsc/exams/${exam.slug}` },
        ]}
      />
      <TnpscExamHubView 
        exam={exam} 
        subjects={subjects} 
        pyqPapers={pyqPapers} 
        topics={topics} 
      />
    </TnpscPortalLayout>
  );
}

