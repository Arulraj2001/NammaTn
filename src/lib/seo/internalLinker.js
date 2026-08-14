/**
 * Internal Linker Utility
 * Dynamic internal link resolver connecting TN Today articles,
 * District Hubs, Category Hubs, and Awareness Guides to pass PageRank authority.
 */

import { DISTRICTS } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";

const AWARENESS_MAPPINGS = {
  electricity: [
    { title: "TANGEDCO / EB Power Cut Complaints & Toll-Free Numbers", url: "/awareness", tag: "EB Helpline" },
    { title: "Know Your Rights: Unannounced Power Outage Rules", url: "/awareness", tag: "Consumer Rights" },
  ],
  "power-cut": [
    { title: "TANGEDCO / EB Power Cut Complaints & Toll-Free Numbers", url: "/awareness", tag: "EB Helpline" },
    { title: "Know Your Rights: Unannounced Power Outage Rules", url: "/awareness", tag: "Consumer Rights" },
  ],
  "water-sanitation": [
    { title: "Metro Water & TWAD Pipeline Leakage Complaint Portal", url: "/awareness", tag: "Water Board" },
    { title: "How to Request Underground Sewerage Cleaning", url: "/awareness", tag: "Sanitation Guide" },
  ],
  "water-issue": [
    { title: "Metro Water & TWAD Pipeline Leakage Complaint Portal", url: "/awareness", tag: "Water Board" },
    { title: "How to Request Underground Sewerage Cleaning", url: "/awareness", tag: "Sanitation Guide" },
  ],
  "road-infrastructure": [
    { title: "How to Report Potholes & Road Hazards to Corporation", url: "/awareness", tag: "Road Safety" },
    { title: "Corporation Contractor Accountability & SLA Rules", url: "/awareness", tag: "Civic Rights" },
  ],
  "road-problem": [
    { title: "How to Report Potholes & Road Hazards to Corporation", url: "/awareness", tag: "Road Safety" },
    { title: "Corporation Contractor Accountability & SLA Rules", url: "/awareness", tag: "Civic Rights" },
  ],
  transport: [
    { title: "MTC & TNSTC Bus Route Complaints & Grievance Cell", url: "/awareness", tag: "Transport" },
    { title: "RTO Online Services & Driving License Portal", url: "/awareness", tag: "RTO Portal" },
  ],
  healthcare: [
    { title: "Chief Minister's Comprehensive Health Insurance Scheme Guide", url: "/awareness", tag: "Health Scheme" },
    { title: "108 Emergency Ambulance & Government Hospital Helplines", url: "/awareness", tag: "Emergency" },
  ],
  education: [
    { title: "School Education Department Grievance Portal", url: "/awareness", tag: "Education" },
    { title: "RTE Free School Admission Guidelines Tamil Nadu", url: "/awareness", tag: "RTE Guide" },
  ],
  environment: [
    { title: "TNPCB Pollution Control & Garbage Burning Complaint Portal", url: "/awareness", tag: "Environment" },
    { title: "Rainwater Harvesting Mandate & Corporation Inspection", url: "/awareness", tag: "RWH Guide" },
  ],
  governance: [
    { title: "CM Cell Special Cell & Online Complaint Tracker", url: "/awareness", tag: "CM Cell" },
    { title: "Right to Information (RTI) Application Guide for Tamil Nadu", url: "/awareness", tag: "RTI Guide" },
  ],
  general: [
    { title: "TN Chief Minister Special Cell Grievance Portal", url: "/awareness", tag: "CM Cell" },
    { title: "VizhiTN Citizen Guide: How to Track Official Complaints", url: "/awareness", tag: "Citizen Guide" },
  ],
};

/**
 * Detect district mentioned in article metadata or content.
 */
export function detectDistrict(article) {
  if (!article) return null;

  // 1. Direct district_slug field
  if (article.district_slug) {
    const found = DISTRICTS.find((d) => d.slug === article.district_slug);
    if (found) return found;
  }

  // 2. Scan title and summary for district names
  const text = `${article.title || ""} ${article.subtitle || ""} ${article.summary || ""}`.toLowerCase();
  for (const d of DISTRICTS) {
    const nameEn = d.name_en.toLowerCase();
    const slug = d.slug.toLowerCase();
    if (text.includes(nameEn) || text.includes(slug)) {
      return d;
    }
  }

  // Default fallback: Chennai as primary capital hub
  return DISTRICTS.find((d) => d.slug === "chennai") || DISTRICTS[0];
}

/**
 * Detect matching category object.
 */
export function detectCategory(article) {
  if (!article || !article.category) return CATEGORIES.find((c) => c.slug === "general") || CATEGORIES[0];
  const slug = article.category.toLowerCase();
  return CATEGORIES.find((c) => c.slug === slug || c.slug.includes(slug)) || CATEGORIES[0];
}

/**
 * Resolve internal links for a TN Today article.
 */
export function resolveArticleInternalLinks(article) {
  if (!article) return { district: null, category: null, awareness: [], civicUrl: "/explore" };

  const district = detectDistrict(article);
  const category = detectCategory(article);
  const categorySlug = article.category || "general";
  const awareness = AWARENESS_MAPPINGS[categorySlug] || AWARENESS_MAPPINGS.general;

  const districtUrl = district ? `/${district.slug}` : "/districts";
  const categoryUrl = category ? `/category/${category.slug}` : "/categories";
  const districtCategoryUrl = district && category ? `/${district.slug}/${category.slug}` : districtUrl;

  return {
    district,
    districtUrl,
    category,
    categoryUrl,
    districtCategoryUrl,
    awareness,
    civicUrl: `/explore?district=${district?.slug || "all"}&category=${category?.slug || "all"}`,
    districtAnchorText: `Explore ${district?.name_en || "District"} Civic Hub & Live Complaints`,
    categoryAnchorText: `Browse all ${category?.name_en || "Category"} Updates in Tamil Nadu`,
  };
}
