'use client';

export default function EventMeta({ event }) {
  if (!event) return null;

  const pills = [
    { emoji: '📷', count: event.evidence_count    ?? 0, label: 'Evidence'  },
    { emoji: '👥', count: event.witness_count     ?? 0, label: 'Witnesses' },
    { emoji: '✅', count: event.verification_count ?? 0, label: 'Verified'  },
    { emoji: '👁️', count: event.view_count        ?? 0, label: 'Views'     },
    { emoji: '🔔', count: event.follower_count    ?? 0, label: 'Following' },
  ];

  return (
    <div className="mb-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
        {pills.map(({ emoji, count, label }) => (
          <div
            key={label}
            className="flex-shrink-0 snap-start flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5 text-sm"
          >
            <span className="text-base leading-none">{emoji}</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
              {count.toLocaleString()}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
