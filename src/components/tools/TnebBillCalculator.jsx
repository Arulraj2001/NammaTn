"use client";

import React, { useState, useMemo } from "react";
import { 
  Zap, Calculator, ShieldCheck, Info, CheckCircle2, 
  AlertTriangle, Share2, Copy, Check, ArrowRight, 
  HelpCircle, Sparkles, TrendingUp, PhoneCall, RefreshCw
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "@/lib/router-compat";

export default function TnebBillCalculator() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [inputMode, setInputMode] = useState("direct"); // "direct" | "readings"
  const [unitsInput, setUnitsInput] = useState("350");
  const [prevReading, setPrevReading] = useState("4200");
  const [currReading, setCurrReading] = useState("4550");
  const [copied, setCopied] = useState(false);

  // Compute total units based on input mode
  const totalUnits = useMemo(() => {
    if (inputMode === "readings") {
      const prev = parseFloat(prevReading) || 0;
      const curr = parseFloat(currReading) || 0;
      return Math.max(0, curr - prev);
    }
    const val = parseFloat(unitsInput);
    return isNaN(val) || val < 0 ? 0 : val;
  }, [inputMode, unitsInput, prevReading, currReading]);

  // TNERC LT-1A Domestic Telescopic Calculation
  const calculation = useMemo(() => {
    const units = totalUnits;
    let payable = 0;
    let fullGross = 0; // Cost if zero subsidy
    const slabs = [];

    if (units <= 500) {
      // Tier 1: <= 500 units (First 200 units Free under TN Govt Subsidy)
      // Slab 1: 0 - 200
      const u1 = Math.min(units, 200);
      slabs.push({
        range: "0 – 200",
        units: u1,
        rate: 0,
        normalRate: 4.95,
        cost: 0,
        subsidized: true,
        labelEn: "First 200 Units (TN Govt 100% Free Subsidy)",
        labelTa: "முதல் 200 யூனிட்கள் (தமிழக அரசின் 100% இலவச மானியம்)"
      });
      fullGross += u1 * 4.95;

      // Slab 2: 201 - 400
      if (units > 200) {
        const u2 = Math.min(units - 200, 200);
        const cost2 = u2 * 4.70;
        payable += cost2;
        fullGross += u2 * 4.95;
        slabs.push({
          range: "201 – 400",
          units: u2,
          rate: 4.70,
          normalRate: 4.95,
          cost: cost2,
          subsidized: true,
          labelEn: "201 – 400 Units (Subsidized Rate ₹4.70)",
          labelTa: "201 – 400 யூனிட்கள் (மானியக் கட்டணம் ₹4.70)"
        });
      }

      // Slab 3: 401 - 500
      if (units > 400) {
        const u3 = units - 400;
        const cost3 = u3 * 6.30;
        payable += cost3;
        fullGross += u3 * 6.65;
        slabs.push({
          range: "401 – 500",
          units: u3,
          rate: 6.30,
          normalRate: 6.65,
          cost: cost3,
          subsidized: true,
          labelEn: "401 – 500 Units (Subsidized Rate ₹6.30)",
          labelTa: "401 – 500 யூனிட்கள் (மானியக் கட்டணம் ₹6.30)"
        });
      }
    } else {
      // Tier 2: > 500 units (First 100 units Free under standard subsidy)
      // Slab 1: 0 - 100
      const u1 = 100;
      slabs.push({
        range: "0 – 100",
        units: u1,
        rate: 0,
        normalRate: 4.95,
        cost: 0,
        subsidized: true,
        labelEn: "First 100 Units (Standard Free Subsidy)",
        labelTa: "முதல் 100 யூனிட்கள் (நிலையான இலவச மானியம்)"
      });
      fullGross += 100 * 4.95;

      // Slab 2: 101 - 400
      const u2 = 300;
      const cost2 = 300 * 4.70;
      payable += cost2;
      fullGross += 300 * 4.95;
      slabs.push({
        range: "101 – 400",
        units: u2,
        rate: 4.70,
        normalRate: 4.95,
        cost: cost2,
        subsidized: false,
        labelEn: "101 – 400 Units (Standard Domestic Rate)",
        labelTa: "101 – 400 யூனிட்கள் (வழக்கமான கட்டணம்)"
      });

      // Slab 3: 401 - 500
      const u3 = 100;
      const cost3 = 100 * 6.30;
      payable += cost3;
      fullGross += 100 * 6.65;
      slabs.push({
        range: "401 – 500",
        units: u3,
        rate: 6.30,
        normalRate: 6.65,
        cost: cost3,
        subsidized: false,
        labelEn: "401 – 500 Units (Rate ₹6.30)",
        labelTa: "401 – 500 யூனிட்கள் (கட்டணம் ₹6.30)"
      });

      // Slab 4: 501 - 600
      if (units > 500) {
        const u4 = Math.min(units - 500, 100);
        const cost4 = u4 * 8.40;
        payable += cost4;
        fullGross += u4 * 8.80;
        slabs.push({
          range: "501 – 600",
          units: u4,
          rate: 8.40,
          normalRate: 8.80,
          cost: cost4,
          subsidized: false,
          labelEn: "501 – 600 Units (High Consumption Slab)",
          labelTa: "501 – 600 யூனிட்கள் (அதிக நுகர்வு கட்டணம்)"
        });
      }

      // Slab 5: 601 - 800
      if (units > 600) {
        const u5 = Math.min(units - 600, 200);
        const cost5 = u5 * 9.45;
        payable += cost5;
        fullGross += u5 * 9.95;
        slabs.push({
          range: "601 – 800",
          units: u5,
          rate: 9.45,
          normalRate: 9.95,
          cost: cost5,
          subsidized: false,
          labelEn: "601 – 800 Units (Rate ₹9.45)",
          labelTa: "601 – 800 யூனிட்கள் (கட்டணம் ₹9.45)"
        });
      }

      // Slab 6: 801 - 1000
      if (units > 800) {
        const u6 = Math.min(units - 800, 200);
        const cost6 = u6 * 10.50;
        payable += cost6;
        fullGross += u6 * 11.05;
        slabs.push({
          range: "801 – 1000",
          units: u6,
          rate: 10.50,
          normalRate: 11.05,
          cost: cost6,
          subsidized: false,
          labelEn: "801 – 1000 Units (Rate ₹10.50)",
          labelTa: "801 – 1000 யூனிட்கள் (கட்டணம் ₹10.50)"
        });
      }

      // Slab 7: > 1000
      if (units > 1000) {
        const u7 = units - 1000;
        const cost7 = u7 * 11.55;
        payable += cost7;
        fullGross += u7 * 12.15;
        slabs.push({
          range: "Above 1000",
          units: u7,
          rate: 11.55,
          normalRate: 12.15,
          cost: cost7,
          subsidized: false,
          labelEn: "Above 1000 Units (Commercial Grade Domestic)",
          labelTa: "1000 யூனிட்களுக்கு மேல்"
        });
      }
    }

    const roundedPayable = Math.round(payable);
    const subsidySaved = Math.max(0, Math.round(fullGross - payable));

    return {
      payable: roundedPayable,
      subsidySaved,
      fullGross: Math.round(fullGross),
      slabs,
      isOver500: units > 500
    };
  }, [totalUnits]);

  const handleShare = () => {
    const text = `💡 My TNEB Electricity Bill Estimate for ${totalUnits} Units:\n💰 Total Payable: ₹${calculation.payable}\n🎁 Govt Subsidy Saved: ₹${calculation.subsidySaved}\nCalculate yours instantly at: https://www.vizhitn.in/tneb-bill-calculator`;
    if (navigator.share) {
      navigator.share({ title: "TNEB Bill Calculator | VizhiTN", text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopy = () => {
    const text = `TNEB Bill for ${totalUnits} Units: ₹${calculation.payable} (Saved ₹${calculation.subsidySaved} via TN Govt Subsidy). Checked on VizhiTN.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* ── Main Calculator Card ────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 mb-2">
              <Zap className="w-3.5 h-3.5 fill-current" />
              {T("Official TNERC Tariff LT-1A (2024–2026)", "அதிகாரப்பூர்வ TNERC கட்டண முறை (LT-1A)")}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {T("Tamil Nadu TNEB Electricity Bill Calculator", "தமிழ்நாடு TNEB மின் கட்டண கால்குலேட்டர்")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {T("Instant bi-monthly domestic slab calculation with 100/200 units free subsidy breakdown.", "இரு மாதங்களுக்கான வீட்டு மின்சார கட்டணம் மற்றும் இலவச மானிய கணக்கீடு.")}
            </p>
          </div>

          {/* Input Mode Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-stretch sm:self-auto">
            <button
              onClick={() => setInputMode("direct")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                inputMode === "direct"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {T("Enter Total Units", "மொத்த யூனிட்கள்")}
            </button>
            <button
              onClick={() => setInputMode("readings")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                inputMode === "readings"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {T("Meter Readings", "மீட்டர் அளவுகள்")}
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-5">
            {inputMode === "direct" ? (
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-2">
                  {T("Consumed Units in 2 Months (Bi-monthly)", "இரு மாதங்களில் பயன்படுத்திய மொத்த யூனிட்கள்")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={unitsInput}
                    onChange={(e) => setUnitsInput(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full text-3xl font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Units (kWh)
                  </span>
                </div>
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium py-1">
                    {T("Common Presets:", "விரைவு தேர்வு:")}
                  </span>
                  {[100, 190, 250, 350, 480, 520, 650].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setUnitsInput(preset.toString())}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300 hover:text-amber-800 transition"
                    >
                      {preset} U
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {T("Previous Meter Reading (from last EB Bill)", "முந்தைய மீட்டர் அளவு (கடந்த பில்லில் உள்ளது)")}
                  </label>
                  <input
                    type="number"
                    value={prevReading}
                    onChange={(e) => setPrevReading(e.target.value)}
                    className="w-full font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {T("Current Meter Reading (today on your meter)", "இன்றைய மீட்டர் அளவு (மீட்டரில் பார்ப்பது)")}
                  </label>
                  <input
                    type="number"
                    value={currReading}
                    onChange={(e) => setCurrReading(e.target.value)}
                    className="w-full font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                  <span>{T("Calculated Units:", "கணக்கிடப்பட்ட யூனிட்கள்:")}</span>
                  <span className="text-base font-extrabold">{totalUnits} Units</span>
                </div>
              </div>
            )}

            {/* Threshold Warning Banner (480 to 520 units alert) */}
            {totalUnits >= 480 && totalUnits <= 540 && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-rose-900 dark:text-rose-300">
                  <strong className="font-bold">
                    {T("Critical 500-Unit Threshold Warning!", "முக்கிய எச்சரிக்கை: 500 யூனிட் வரம்பு!")}
                  </strong>{" "}
                  {T(
                    "In Tamil Nadu, consuming 501 units instead of 500 causes you to lose the free 101–200 unit subsidy, spiking your bill by nearly ₹700+. Keeping consumption under 500 saves huge money!",
                    "தமிழ்நாட்டில் 500 யூனிட்களுக்கு மேல் 1 யூனிட் அதிகமானாலும் (501 Units), முதல் 200 யூனிட் இலவச சலுகை ரத்தாகி பில் ₹700 வரை கூடும்!"
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Result Card */}
          <div className="md:col-span-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-lg relative border border-indigo-900/50">
            <div>
              <div className="flex items-center justify-between text-xs text-indigo-200 font-bold uppercase tracking-wider mb-2">
                <span>{T("Estimated Bi-monthly Bill", "மதிப்பிடப்பட்ட இரு மாத கட்டணம்")}</span>
                <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  {totalUnits} Units
                </span>
              </div>
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-white flex items-baseline gap-1 my-3">
                <span className="text-2xl text-amber-400 font-bold">₹</span>
                {calculation.payable.toLocaleString("en-IN")}
              </div>

              {/* Subsidy Highlight */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{T("TN Govt Subsidy Saved:", "தமிழக அரசு மானிய சேமிப்பு:")}</span>
                </div>
                <span className="font-extrabold text-sm text-emerald-400">
                  ₹{calculation.subsidySaved.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>{T("Cost Without Subsidy:", "மானியம் இல்லாத கட்டணம்:")}</span>
                  <span className="line-through text-slate-400">₹{calculation.fullGross}</span>
                </div>
                <div className="flex justify-between">
                  <span>{T("Fixed Charges (Domestic):", "நிலையான கட்டணம் (வீட்டு பயன்பாடு):")}</span>
                  <span className="text-emerald-400 font-semibold">{T("₹0 (100% Absorbed)", "₹0 (அரசு செலுத்துகிறது)")}</span>
                </div>
                <div className="flex justify-between">
                  <span>{T("Billing Cycle:", "பில்லிங் காலம்:")}</span>
                  <span className="text-slate-200 font-semibold">{T("Every 2 Months (Bi-monthly)", "இரு மாதங்களுக்கு ஒரு முறை")}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-6 mt-4 border-t border-slate-800">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition active:scale-95 shadow-md shadow-amber-500/20"
              >
                <Share2 className="w-4 h-4" />
                {T("Share on WhatsApp", "வாட்ஸ்அப்பில் பகிர்")}
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition"
                title="Copy breakdown"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? T("Copied!", "நகலெடுக்கப்பட்டது!") : T("Copy", "நகலெடு")}
              </button>
            </div>
          </div>
        </div>

        {/* ── Slab Breakdown Table ────────────────────────────────────── */}
        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-amber-500" />
            {T("Telescopic Slab Calculation Breakdown", "யூனிட் வாரியான கட்டண கணக்கீடு விவரம்")}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3 pr-4">{T("Slab Range", "யூனிட் வரம்பு")}</th>
                  <th className="pb-3 px-4">{T("Units Billed", "கணக்கிடப்பட்ட யூனிட்")}</th>
                  <th className="pb-3 px-4">{T("Rate / Unit", "யூனிட் வீதம்")}</th>
                  <th className="pb-3 pl-4 text-right">{T("Payable Amount", "செலுத்த வேண்டிய தொகை")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {calculation.slabs.map((slab, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>{slab.range} Units</span>
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                        {T(slab.labelEn, slab.labelTa)}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{slab.units} U</td>
                    <td className="py-3 px-4 font-semibold">
                      {slab.rate === 0 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                          {T("FREE (₹0)", "இலவசம் (₹0)")}
                        </span>
                      ) : (
                        `₹${slab.rate.toFixed(2)}`
                      )}
                    </td>
                    <td className="py-3 pl-4 text-right font-bold text-slate-900 dark:text-white">
                      {slab.cost === 0 ? "₹0.00" : `₹${slab.cost.toFixed(2)}`}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 dark:bg-slate-800/60 font-black text-slate-900 dark:text-white text-sm">
                  <td className="py-4 pr-4 pl-3 rounded-l-xl">{T("Net Payable Total", "மொத்த நிகர கட்டணம்")}</td>
                  <td className="py-4 px-4">{totalUnits} Units</td>
                  <td className="py-4 px-4 text-emerald-600 dark:text-emerald-400">
                    -{T("Subsidy: ₹", "மானியம்: ₹")}{calculation.subsidySaved}
                  </td>
                  <td className="py-4 pl-4 pr-3 text-right rounded-r-xl text-amber-600 dark:text-amber-400 text-lg">
                    ₹{calculation.payable.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Practical Energy Saving Tips for Tamil Nadu ────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
            {T("The 500-Units Threshold Trick", "500 யூனிட் வரம்பு உத்தி")}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {T(
              "If your meter is nearing 490 units on day 55, turn off one AC or high-wattage water heater for 4 days. Staying below 500 units saves up to ₹700 in electricity charges instantly.",
              "உங்கள் பில்லிங் முடிவதற்குள் 500 யூனிட்டுக்குள் வைத்துக்கொண்டால், முதல் 200 யூனிட் இலவசம் கிடைத்து ₹700 வரை மிச்சப்படுத்தலாம்."
            )}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
            {T("AC Temperature at 24°C", "ஏசி வெப்பநிலையை 24°Cல் வைக்கவும்")}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {T(
              "Every 1°C increase above 18°C saves approximately 6% electricity consumption. Keeping split inverters at 24°C to 26°C provides optimal comfort and reduced monthly bills.",
              "ஏசியை 18°Cக்கு பதிலாக 24°Cல் வைத்தால் 15% முதல் 20% வரை மின் நுகர்வு குறையும்."
            )}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
            {T("Meter Fault & Helpline 1912", "மீட்டர் தவறு & உதவி எண் 1912")}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {T(
              "Suspecting a faulty fast meter or irregular assessment? Call TANGEDCO Minnalagam 24x7 control room at 1912 or register an official inspection through VizhiTN.",
              "மீட்டர் வேகமாக ஓடுவதாக உணர்ந்தாலோ அல்லது முறைகேடான கணக்கீடோ இருந்தால் மின்வாரிய மின்னகம் 1912 எண்ணை தொடர்பு கொள்ளவும்."
            )}
          </p>
        </div>
      </div>

      {/* ── Internal Hub Links ─────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
            {T("Track Power Cuts in Your District Today", "இன்று உங்கள் மாவட்டத்தில் மின்தடை உள்ளதா?")}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {T("Check live scheduled TANGEDCO substation maintenance shutdowns across all 38 districts.", "தமிழ்நாட்டின் 38 மாவட்டங்களுக்கான இன்றைய மின் தடை அறிவிப்புகளை அறியுங்கள்.")}
          </p>
        </div>
        <Link
          href="/power-cuts-today-tamil-nadu"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition shrink-0"
        >
          <span>{T("View Today's Power Cuts", "இன்றைய மின்தடை பட்டியல்")}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
