'use client';

const SEVERITIES = [
  {
    value: 'minor',
    label: 'Minor',
    description: 'Low impact, not urgent',
    colors: {
      border:   'border-slate-400',
      bg:       'bg-slate-100 dark:bg-slate-800',
      text:     'text-slate-700 dark:text-slate-200',
      dot:      'bg-slate-400',
      selected: 'bg-slate-200 dark:bg-slate-700 border-slate-500',
      ring:     'focus-visible:ring-slate-400',
    },
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Noticeable disruption',
    colors: {
      border:   'border-amber-400',
      bg:       'bg-amber-50 dark:bg-amber-900/20',
      text:     'text-amber-800 dark:text-amber-200',
      dot:      'bg-amber-400',
      selected: 'bg-amber-100 dark:bg-amber-900/40 border-amber-500',
      ring:     'focus-visible:ring-amber-400',
    },
  },
  {
    value: 'major',
    label: 'Major',
    description: 'Significant impact',
    colors: {
      border:   'border-orange-400',
      bg:       'bg-orange-50 dark:bg-orange-900/20',
      text:     'text-orange-800 dark:text-orange-200',
      dot:      'bg-orange-400',
      selected: 'bg-orange-100 dark:bg-orange-900/40 border-orange-500',
      ring:     'focus-visible:ring-orange-400',
    },
  },
  {
    value: 'critical',
    label: 'Critical',
    description: 'Immediate danger or crisis',
    colors: {
      border:   'border-red-500',
      bg:       'bg-red-50 dark:bg-red-900/20',
      text:     'text-red-800 dark:text-red-200',
      dot:      'bg-red-500',
      selected: 'bg-red-100 dark:bg-red-900/40 border-red-600',
      ring:     'focus-visible:ring-red-500',
    },
  },
];

export default function SeveritySelector({ value, onChange }) {
  return (
    <div className="w-full">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
        Severity Level
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SEVERITIES.map((sev) => {
          const isSelected = value === sev.value;
          const c = sev.colors;
          return (
            <button
              key={sev.value}
              type="button"
              onClick={() => onChange(sev.value)}
              aria-pressed={isSelected}
              className={[
                'relative flex flex-col items-start gap-0.5 rounded-xl border-2 px-3 py-3 transition-all duration-150 cursor-pointer text-left',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                c.ring,
                isSelected
                  ? `${c.selected} shadow-sm`
                  : `${c.border} bg-white dark:bg-gray-800 hover:${c.bg}`,
              ].join(' ')}
            >
              {/* Severity dot indicator */}
              <span className={`inline-block w-2.5 h-2.5 rounded-full mb-1 ${c.dot}`} />
              <span
                className={[
                  'text-sm font-semibold',
                  isSelected ? c.text : 'text-gray-800 dark:text-gray-200',
                ].join(' ')}
              >
                {sev.label}
              </span>
              <span
                className={[
                  'text-xs leading-tight',
                  isSelected ? c.text : 'text-gray-500 dark:text-gray-400',
                ].join(' ')}
              >
                {sev.description}
              </span>
              {isSelected && (
                <span className="absolute top-2 right-2 text-xs font-bold opacity-70">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
