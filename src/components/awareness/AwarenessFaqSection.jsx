import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function AwarenessFaqSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["awarenessFaqs"],
    queryFn: () => base44.entities.AwarenessFaq.filter({ is_active: true }, "sort_order"),
  });

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-64 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const visibleFaqs = faqs.slice(0, 6);
  const leftFaqs = visibleFaqs.filter((_, i) => i % 2 === 0);
  const rightFaqs = visibleFaqs.filter((_, i) => i % 2 === 1);

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-500" />
          {T("Frequently Asked Questions", "அடிக்கடி கேட்கப்படும் கேள்விகள்")}
        </h2>
        <Link
          to="/awareness/faqs"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all FAQs", "அனைத்து கேள்விகள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2-column accordion grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
        {/* Left column */}
        <Accordion type="multiple" className="w-full">
          {leftFaqs.map((faq) => {
            const question = lang === "ta" ? faq.question_ta || faq.question_en : faq.question_en;
            const answer = lang === "ta" ? faq.answer_ta || faq.answer_en : faq.answer_en;
            return (
              <AccordionItem
                key={faq.id}
                value={`faq-${faq.id}`}
                className="border border-slate-200 dark:border-slate-700 rounded-xl mb-3 px-4 overflow-hidden bg-white dark:bg-slate-800"
              >
                <AccordionTrigger className="text-sm font-medium text-slate-800 dark:text-white hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Right column */}
        <Accordion type="multiple" className="w-full">
          {rightFaqs.map((faq) => {
            const question = lang === "ta" ? faq.question_ta || faq.question_en : faq.question_en;
            const answer = lang === "ta" ? faq.answer_ta || faq.answer_en : faq.answer_en;
            return (
              <AccordionItem
                key={faq.id}
                value={`faq-${faq.id}`}
                className="border border-slate-200 dark:border-slate-700 rounded-xl mb-3 px-4 overflow-hidden bg-white dark:bg-slate-800"
              >
                <AccordionTrigger className="text-sm font-medium text-slate-800 dark:text-white hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}
