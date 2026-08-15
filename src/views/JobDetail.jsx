"use client";
import React from "react";
import { Briefcase, MapPin, DollarSign, Clock, Share2, Flag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";

import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";

export default function JobDetail({ initialJob }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const job = initialJob;

  if (!job) return <div className="min-h-screen flex items-center justify-center"><p>{T("Job not found", "வேலை கண்டறியப்படவில்லை")}</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <main className="lg:col-span-8">
            {/* Hero Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{job.title}</h1>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                    {job.district_name && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {job.district_name} {job.area_name && `• ${job.area_name}`}
                      </span>
                    )}
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {formatDistanceToNow(new Date(job.created_date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6 space-y-6">
              <section>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{T("Description", "விளக்கம்")}</h2>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{job.description}</p>
              </section>

              {job.job_type && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">{T("Job Type", "வேலை வகை")}</h3>
                  <p className="text-slate-900 dark:text-white capitalize">{job.job_type.replace(/_/g, " ")}</p>
                </section>
              )}

              {job.salary_info && (
                <section>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    <DollarSign className="w-4 h-4" />
                    {T("Salary/Duration", "சம்பளம் / கால அளவு")}
                  </h3>
                  <p className="text-slate-900 dark:text-white">{job.salary_info}</p>
                </section>
              )}

              {job.duration && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">{T("Duration", "கால அளவு")}</h3>
                  <p className="text-slate-900 dark:text-white">{job.duration}</p>
                </section>
              )}

              {job.contact_visible && job.contact_info && (
                <section className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-green-900 dark:text-green-400 mb-2">{T("Contact", "தொடர்பு")}</h3>
                  <p className="text-green-800 dark:text-green-300 font-mono">{job.contact_info}</p>
                </section>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                <Share2 className="w-4 h-4" />
                {T("Share", "பகிர்")}
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Flag className="w-4 h-4" />
                {T("Report", "புகாரளி")}
              </button>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4">
            <SidebarRelatedLinks type="job" />
          </aside>
        </div>
      </div>
    </div>
  );
}
