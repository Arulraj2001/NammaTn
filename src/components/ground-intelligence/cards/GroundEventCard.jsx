'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Camera, Users } from 'lucide-react';
import {
  STATUS_CONFIG,
  SEVERITY_CONFIG,
  BORDER_BY_SEVERITY,
} from '@/components/ground-intelligence/event/statusHelpers';
import { calculateConfidence } from '@/services/groundIntelligence';

// ─── Category display map ──────────────────────────────────────────────────────
const CATEGORY_DISPLAY = {
  flooding:       { emoji: '🌊', label: 'Flooding' },
  water_supply:   { emoji: '💧', label: 'Water Supply' },
  power_failure:  { emoji: '⚡', label: 'Power Failure' },
  road_damage:    { emoji: '🛣️', label: 'Road Damage' },
  tree_fallen:    { emoji: '🌳', label: 'Tree Fallen' },
  accident:       { emoji: '🚗', label: 'Accident' },
  fire:           { emoji: '🔥', label: 'Fire' },
  traffic:        { emoji: '🚦', label: 'Traffic' },
  hospital_crowd: { emoji: '🏥', label: 'Hospital' },
  office_closure: { emoji: '🏢', label: 'Office Closure' },
  public_safety:  { emoji: '🛡️', label: 'Public Safety' },
  scam_activity:  { emoji: '⚠️', label: 'Scam Activity' },
  crowd:          { emoji: '👥', label: 'Crowd' },
  festival:       { emoji: '🎉', label: 'Festival' },
};

// ─── Relative time helper ──────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Confidence colour dot ─────────────────────────────────────────────────────
const CONFIDENCE_COLOR = {
  low:      'text-slate-400',
  medium:   'text-amber-500',
  high:     'text-blue-500',
  verified: 'text-green-500',
};

const CONFIDENCE_ICON = {
  low:      '○',
  medium:   '◑',
  high:     '●',
  verified: '✓',
};

// ─── Card slide-up animation ──────────────────────────────────────────────────
const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function GroundEventCard({ event, compact = false }) {
  const router = useRouter();

  if (!event) return null;

  const statusCfg   = STATUS_CONFIG[event.status]   || STATUS_CONFIG.reported;
  const severityCfg = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.moderate;
  const borderClass = BORDER_BY_SEVERITY[event.severity] || 'border-l-amber-500';
  const catDisplay  = CATEGORY_DISPLAY[event.category_slug] || { emoji: '📍', label: event.category_slug || 'Event' };
  const confidence  = calculateConfidence(event);
  const confColor   = CONFIDENCE_COLOR[confidence.level] || 'text-slate-400';
  const confIcon    = CONFIDENCE_ICON[confidence.level]  || '○';

  const handleClick = () => router.push(`/tn-live/event/${event.id}`);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: compact ? 1 : 1.005 }}
      onClick={handleClick}
      className={[
        'cursor-pointer border-l-4 rounded-r-lg bg-white dark:bg-gray-900',
        'border border-gray-100 dark:border-gray-800 shadow-sm',
        'hover:shadow-md transition-shadow select-none',
        borderClass,
        compact ? 'px-3 py-2' : 'px-3 py-3',
      ].join(' ')}
    >
      {/* ── Row 1: Badges + Category ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Status badge */}
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${statusCfg.color}`}>
            {statusCfg.label === 'LIVE' && (
              <span className={`w-1.5 h-1.5 rounded-full mr-1 animate-pulse ${statusCfg.dot}`} />
            )}
            {statusCfg.label}
          </span>
          {/* Severity badge */}
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${severityCfg.color}`}>
            {severityCfg.label}
          </span>
        </div>
        {/* Category */}
        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
          {catDisplay.emoji} {catDisplay.label}
        </span>
      </div>

      {/* ── Row 2: Title ─────────────────────────────────────────────────── */}
      <p className={[
        'font-semibold text-gray-900 dark:text-gray-100 leading-snug',
        compact
          ? 'text-sm truncate'
          : 'text-sm line-clamp-2',
      ].join(' ')}>
        {event.title}
      </p>

      {/* ── Row 3: Location + Time ───────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
        <MapPin size={10} className="flex-shrink-0" />
        <span className="truncate">
          {[event.area_name, event.district_name].filter(Boolean).join(', ') || 'Tamil Nadu'}
        </span>
        <span className="mx-0.5 opacity-50">·</span>
        <span className="whitespace-nowrap flex-shrink-0">{timeAgo(event.created_at)}</span>
      </div>

      {/* ── Row 4: Metadata (full card only) ────────────────────────────── */}
      {!compact && (
        <>
          <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Camera size={10} />
                {event.evidence_count ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Users size={10} />
                {event.witness_count ?? 0}
              </span>
              <span className={`flex items-center gap-0.5 font-mono ${confColor}`}>
                <span className="text-xs">{confIcon}</span>
                <span className="text-[10px] uppercase">{confidence.level}</span>
              </span>
            </div>
            {/* Event code */}
            <span className="font-mono text-[10px] text-gray-400 dark:text-gray-600 tracking-tight">
              {event.event_code || '—'}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}
