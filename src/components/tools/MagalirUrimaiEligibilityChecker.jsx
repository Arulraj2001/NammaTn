"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react";

export default function MagalirUrimaiEligibilityChecker() {
  const [answers, setAnswers] = useState({
    income: null,      // true if <= 2.5 Lakhs
    electricity: null, // true if <= 3600 units
    land: null,        // true if <= 5 acres wetland or 10 acres dryland
    vehicle: null,     // true if NO car/4-wheeler
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const isAllAnswered = Object.values(answers).every((val) => val !== null);
  const isEligible = answers.income && answers.electricity && answers.land && answers.vehicle;

  const handleReset = () => {
    setAnswers({ income: null, electricity: null, land: null, vehicle: null });
    setSubmitted(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold text-xs uppercase tracking-wider mb-2">
        <ShieldCheck className="w-4 h-4" />
        Interactive Eligibility Quiz (தகுதி சரிபார்ப்பு)
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        Check Your Family's ₹1,000/Month Eligibility in 30 Seconds
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-6">
        Answer the 4 official government criteria to instantly verify if your family qualifies for Kalaignar Magalir Urimai Thogai:
      </p>

      <div className="space-y-4">
        {/* Question 1: Annual Income */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <p className="font-semibold text-sm text-slate-900 dark:text-white">
            1. Is your family's total annual income less than ₹2.5 Lakhs?
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            குடும்ப ஆண்டு வருமானம் ₹2.5 லட்சத்திற்குள் உள்ளதா?
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleSelect("income", true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                answers.income === true
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              ✓ Yes (ஆம், ₹2.5L கீழ்)
            </button>
            <button
              onClick={() => handleSelect("income", false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                answers.income === false
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              ✕ No (இல்லை, ₹2.5L மேல்)
            </button>
          </div>
        </div>

        {/* Question 2: Electricity Usage */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <p className="font-semibold text-sm text-slate-900 dark:text-white">
            2. Does your domestic electricity consumption stay under 3,600 units/year (approx 600 units per bi-monthly bill)?
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ஆண்டுக்கு 3,600 யூனிட்டுகளுக்குள் மின்சாரம் பயன்படுத்துகிறீர்களா?
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleSelect("electricity", true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                answers.electricity === true
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              ✓ Yes (Under 3,600 Units)
            </button>
            <button
              onClick={() => handleSelect("electricity", false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                answers.electricity === false
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              ✕ No (Above 3,600 Units)
            </button>
          </div>
        </div>

        {/* Question 3: Land Ownership */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <p className="font-semibold text-sm text-slate-900 dark:text-white">
            3. Do you own less than 5 acres of wetland (நன்செய்) or less than 10 acres of dryland (புன்செய்)?
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            5 ஏக்கருக்கும் குறைவான நன்செய் அல்லது 10 ஏக்கருக்கும் குறைவான புன்செய் நிலமா?
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleSelect("land", true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                answers.land === true
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              ✓ Yes (No Land / Within Limit)
            </button>
            <button
              onClick={() => handleSelect("land", false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                answers.land === false
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              ✕ No (Own More Land)
            </button>
          </div>
        </div>

        {/* Question 4: Four-Wheeler */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <p className="font-semibold text-sm text-slate-900 dark:text-white">
            4. Does anyone in your family own a personal four-wheeler (car, jeep, commercial vehicle)?
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            குடும்பத்தில் கார், ஜீப் போன்ற சொந்த நான்கு சக்கர வாகனம் உள்ளதா?
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleSelect("vehicle", true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                answers.vehicle === true
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              ✓ No Car (நான்கு சக்கர வாகனம் இல்லை)
            </button>
            <button
              onClick={() => handleSelect("vehicle", false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                answers.vehicle === false
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              ✕ Yes, Have a Car (கார் உள்ளது)
            </button>
          </div>
        </div>
      </div>

      {/* Result Card */}
      {isAllAnswered && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-300">
          {isEligible ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
                    Congratulations! Your Family Meets the Primary Criteria
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                    உங்கள் குடும்பம் மகளிர் உரிமைத் தொகை ₹1,000 பெற தேவையான தகுதிகளைக் கொண்டுள்ளது.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                If your application was previously rejected due to a data discrepancy, you can submit an appeal at your nearest <strong>e-Sevai centre</strong> within 30 days or call the CM Helpline at <strong>1100</strong>.
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 text-base">
                    One or More Criteria Exceeded the Government Limit
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                    ஒன்று அல்லது அதற்கு மேற்பட்ட நிபந்தனைகள் அரசு நிர்ணயித்த வரம்பிற்கு மேல் உள்ளது.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                If you believe your government records (such as electricity meter linkage or old vehicle registration) are incorrect, visit your local Taluk Office on Tuesday Grievance Day to correct your family records.
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Quiz (மீண்டும் தொடங்கு)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
