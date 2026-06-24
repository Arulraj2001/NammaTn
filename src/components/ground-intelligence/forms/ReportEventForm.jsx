'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, EyeOff } from 'lucide-react';

import { useAuth }                from '@/lib/AuthContext';
import {
  createGroundEvent,
  uploadEvidence,
  detectNearbyDuplicates,
} from '@/services/groundIntelligence';

import CategoryPicker         from './CategoryPicker';
import SeveritySelector       from './SeveritySelector';
import GpsCapture             from './GpsCapture';
import EvidenceUploader       from './EvidenceUploader';
import DuplicateDetectionAlert from './DuplicateDetectionAlert';

// Tamil Nadu districts list (common ones)
const TN_DISTRICTS = [
  'Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri',
  'Dindigul','Erode','Kallakurichi','Kancheepuram','Kanyakumari','Karur',
  'Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal',
  'Nilgiris','Perambalur','Pudukkottai','Ramanathapuram','Ranipet',
  'Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi',
  'Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur',
  'Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar',
];

const STEPS = [
  { id: 1, label: 'Category' },
  { id: 2, label: 'Details'  },
  { id: 3, label: 'Location' },
  { id: 4, label: 'Evidence' },
];

// ─── Progress bar ────────────────────────────────────────────────────────────
function StepProgress({ step }) {
  return (
    <div className="w-full mb-6">
      {/* Step labels */}
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-1">
            <div
              className={[
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200',
                step > s.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : step === s.id
                  ? 'bg-white dark:bg-gray-900 border-blue-600 text-blue-600'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500',
              ].join(' ')}
            >
              {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
            </div>
            <span
              className={[
                'text-[10px] font-medium hidden sm:block',
                step === s.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : step > s.id
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-600',
              ].join(' ')}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
      {/* Progress track */}
      <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-right">
        Step {step} of {STEPS.length}
      </p>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
        {title}
      </label>
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Input / Textarea ────────────────────────────────────────────────────────
function Input({ id, value, onChange, placeholder, required, maxLength, type = 'text', list }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      list={list}
      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
    />
  );
}

function Textarea({ id, value, onChange, placeholder, required, rows = 4, maxLength }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      maxLength={maxLength}
      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
    />
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateStep(step, form) {
  switch (step) {
    case 1:
      if (!form.category_slug) return 'Please select a category.';
      break;
    case 2:
      if (!form.title || form.title.trim().length < 10)
        return 'Title must be at least 10 characters.';
      if (!form.description || form.description.trim().length < 20)
        return 'Description must be at least 20 characters.';
      break;
    case 3:
      if (!form.district_name) return 'Please select a district.';
      break;
    case 4:
      if (!form.files || form.files.length === 0)
        return 'Please upload at least one photo or video as evidence.';
      break;
    default:
      break;
  }
  return null;
}

// ─── Main form ────────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  category_slug:     '',
  subcategory_slug:  '',
  title:             '',
  description:       '',
  district_name:     '',
  area_name:         '',
  location_text:     '',
  latitude:          null,
  longitude:         null,
  location_accuracy: 'manual',
  severity:          'moderate',
  is_anonymous:      false,
};

export default function ReportEventForm() {
  const router     = useRouter();
  const { user }   = useAuth();

  const [form, setForm]                   = useState(INITIAL_FORM);
  const [files, setFiles]                 = useState([]);
  const [step, setStep]                   = useState(1);
  const [stepError, setStepError]         = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [submitError, setSubmitError]     = useState('');
  const [duplicates, setDuplicates]       = useState([]);
  const [showDuplicates, setShowDuplicates] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Duplicate detection ────────────────────────────────────────────────────
  async function runDuplicateCheck(overrides = {}) {
    const merged = { ...form, ...overrides };
    if (!merged.latitude || !merged.longitude || !merged.category_slug) return;
    try {
      const found = await detectNearbyDuplicates({
        latitude:      merged.latitude,
        longitude:     merged.longitude,
        category_slug: merged.category_slug,
      });
      setDuplicates(found);
      setShowDuplicates(found.length > 0);
    } catch (_) {
      // Non-critical — ignore duplicate check errors
    }
  }

  // ── GPS capture callback ───────────────────────────────────────────────────
  function handleGpsCapture(lat, lng, accuracy) {
    const acc = accuracy < 50 ? 'gps' : 'approximate';
    setForm((prev) => ({
      ...prev,
      latitude:          lat,
      longitude:         lng,
      location_accuracy: acc,
    }));
    runDuplicateCheck({ latitude: lat, longitude: lng });
  }

  // ── Category change ────────────────────────────────────────────────────────
  function handleCategoryChange(slug) {
    setField('category_slug', slug);
    // If we already have coordinates, check for dupes with new category
    if (form.latitude && form.longitude) {
      runDuplicateCheck({ category_slug: slug });
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function handleNext() {
    const err = validateStep(step, { ...form, files });
    if (err) { setStepError(err); return; }
    setStepError('');
    if (step === 1) {
      // After picking category, if we have GPS already check duplicates
      runDuplicateCheck();
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setStepError('');
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Join existing event ────────────────────────────────────────────────────
  function handleJoinExisting(eventId) {
    router.push(`/tn-live/event/${eventId}`);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const err = validateStep(4, { ...form, files });
    if (err) { setStepError(err); return; }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const event = await createGroundEvent({
        ...form,
      });
      if (files.length > 0) {
        await uploadEvidence(event.id, files, {
          is_anonymous: form.is_anonymous,
        });
      }
      router.push(`/tn-live/event/${event.id}`);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(
        error?.message || 'Something went wrong. Please try again.'
      );
      setIsSubmitting(false);
    }
  }

  // ── Render step content ────────────────────────────────────────────────────
  function renderStep() {
    switch (step) {
      // ────────── STEP 1: Category ──────────
      case 1:
        return (
          <div className="space-y-4">
            <CategoryPicker
              value={form.category_slug}
              onChange={handleCategoryChange}
            />
          </div>
        );

      // ────────── STEP 2: Details ──────────
      case 2:
        return (
          <div className="space-y-5">
            <Section
              title="Event Title *"
              hint="Be specific — e.g. 'Severe water logging near Anna Nagar signal'"
            >
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="What is happening? (min 10 characters)"
                required
                maxLength={120}
              />
              <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-1">
                {form.title.length}/120
              </p>
            </Section>

            <Section
              title="Description *"
              hint="Describe what you see — time, scale, any injuries, road blocked, etc."
            >
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Describe the situation in detail... (min 20 characters)"
                required
                rows={5}
                maxLength={2000}
              />
              <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-1">
                {form.description.length}/2000
              </p>
            </Section>

            <Section
              title="Severity Level"
              hint="Your assessment of the impact level"
            >
              <SeveritySelector
                value={form.severity}
                onChange={(v) => setField('severity', v)}
              />
            </Section>
          </div>
        );

      // ────────── STEP 3: Location ──────────
      case 3:
        return (
          <div className="space-y-5">
            <Section title="District *" hint="Select the Tamil Nadu district where this event is occurring">
              <>
                <Input
                  id="district_name"
                  value={form.district_name}
                  onChange={(e) => setField('district_name', e.target.value)}
                  placeholder="Type or select district…"
                  required
                  list="tn-districts-list"
                />
                <datalist id="tn-districts-list">
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </>
            </Section>

            <Section title="Area / Locality" hint="Street, neighbourhood, or landmark name">
              <Input
                id="area_name"
                value={form.area_name}
                onChange={(e) => setField('area_name', e.target.value)}
                placeholder="e.g. Anna Nagar, T. Nagar, Velachery…"
                maxLength={100}
              />
            </Section>

            <Section
              title="Location Description"
              hint="More specific landmark or address (optional)"
            >
              <Textarea
                id="location_text"
                value={form.location_text}
                onChange={(e) => setField('location_text', e.target.value)}
                placeholder="Near landmark, bus stop, junction… (optional)"
                rows={2}
                maxLength={300}
              />
            </Section>

            <Section
              title="GPS Location"
              hint="Capture your precise GPS coordinates for better accuracy"
            >
              <GpsCapture onCapture={handleGpsCapture} />
              {form.latitude && (
                <div className="mt-2 p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Accuracy mode:{' '}
                    <span className="font-semibold text-green-600 dark:text-green-400 capitalize">
                      {form.location_accuracy}
                    </span>
                    {' · '}
                    <span className="font-mono text-gray-600 dark:text-gray-300">
                      {form.latitude?.toFixed(5)}, {form.longitude?.toFixed(5)}
                    </span>
                  </p>
                </div>
              )}
            </Section>

            {/* Duplicate detection alert (shown here and below if found after GPS) */}
            {showDuplicates && (
              <DuplicateDetectionAlert
                duplicates={duplicates}
                onJoinExisting={handleJoinExisting}
                onContinueAnyway={() => setShowDuplicates(false)}
              />
            )}
          </div>
        );

      // ────────── STEP 4: Evidence + Submit ──────────
      case 4:
        return (
          <div className="space-y-5">
            {showDuplicates && (
              <DuplicateDetectionAlert
                duplicates={duplicates}
                onJoinExisting={handleJoinExisting}
                onContinueAnyway={() => setShowDuplicates(false)}
              />
            )}

            <Section
              title="Evidence *"
              hint="Upload photos or videos from the scene. At least 1 required."
            >
              <EvidenceUploader files={files} onChange={setFiles} />
            </Section>

            {/* Anonymous toggle */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <label
                htmlFor="anonymous-toggle"
                className="flex items-start gap-3 cursor-pointer"
              >
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    id="anonymous-toggle"
                    type="checkbox"
                    checked={form.is_anonymous}
                    onChange={(e) => setField('is_anonymous', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-blue-600 transition-colors" />
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Submit Anonymously
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                    Your name will not be displayed publicly. Your report still helps the community.
                  </p>
                </div>
              </label>
            </div>

            {/* Review summary */}
            <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 space-y-2">
              <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                Review Your Report
              </p>
              <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium text-gray-500 dark:text-gray-400 w-20 inline-block">Category:</span>{' '}
                  <span className="font-semibold capitalize">{form.category_slug.replace(/_/g, ' ')}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-500 dark:text-gray-400 w-20 inline-block">Severity:</span>{' '}
                  <span className="font-semibold capitalize">{form.severity}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-500 dark:text-gray-400 w-20 inline-block">Title:</span>{' '}
                  {form.title}
                </p>
                <p>
                  <span className="font-medium text-gray-500 dark:text-gray-400 w-20 inline-block">District:</span>{' '}
                  {form.district_name}
                  {form.area_name ? `, ${form.area_name}` : ''}
                </p>
                <p>
                  <span className="font-medium text-gray-500 dark:text-gray-400 w-20 inline-block">Evidence:</span>{' '}
                  {files.length} file{files.length !== 1 ? 's' : ''}
                </p>
                {form.latitude && (
                  <p>
                    <span className="font-medium text-gray-500 dark:text-gray-400 w-20 inline-block">GPS:</span>{' '}
                    <span className="font-mono">
                      {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{submitError}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Progress indicator */}
      <StepProgress step={step} />

      {/* Step title */}
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
          {step === 1 && 'What type of event is this?'}
          {step === 2 && 'Describe what\'s happening'}
          {step === 3 && 'Where is this happening?'}
          {step === 4 && 'Add evidence & submit'}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {step === 1 && 'Choose the category that best describes the situation.'}
          {step === 2 && 'A clear title and description helps the community verify this event.'}
          {step === 3 && 'Precise location helps responders and other witnesses find this event.'}
          {step === 4 && 'Photo or video evidence increases the credibility of your report.'}
        </p>
      </div>

      {/* Step content */}
      <div className="min-h-[260px]">
        {renderStep()}
      </div>

      {/* Step validation error */}
      {stepError && (
        <div className="mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">{stepError}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}

        <div className="flex-1" />

        {step < STEPS.length ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 shadow-sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 shadow-sm disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Report
              </>
            )}
          </button>
        )}
      </div>

      {/* Not logged in warning */}
      {!user && step === 4 && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-400 text-center">
          ⚠ You are not signed in. Your report will be submitted anonymously.
        </p>
      )}
    </form>
  );
}
