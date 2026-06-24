'use client';

const CATEGORIES = [
  { slug: 'flooding',       emoji: '🌊', label: 'Water Logging'   },
  { slug: 'power_failure',  emoji: '⚡', label: 'Power Failure'   },
  { slug: 'road_damage',    emoji: '🚧', label: 'Road Damage'     },
  { slug: 'tree_fallen',    emoji: '🌳', label: 'Tree Fallen'     },
  { slug: 'accident',       emoji: '🚗', label: 'Accident'        },
  { slug: 'fire',           emoji: '🔥', label: 'Fire'            },
  { slug: 'traffic',        emoji: '🚦', label: 'Traffic'         },
  { slug: 'crowd',          emoji: '👥', label: 'Crowd'           },
  { slug: 'office_closure', emoji: '🏛️', label: 'Office Closure'  },
  { slug: 'public_safety',  emoji: '⚠️', label: 'Public Safety'  },
  { slug: 'scam_activity',  emoji: '🚨', label: 'Scam / Fraud'    },
  { slug: 'hospital_crowd', emoji: '🏥', label: 'Hospital Crowd'  },
  { slug: 'festival',       emoji: '🎉', label: 'Festival'        },
  { slug: 'water_supply',   emoji: '💧', label: 'Water Supply'    },
  { slug: 'other',          emoji: '📍', label: 'Other'           },
];

export default function CategoryPicker({ value, onChange }) {
  return (
    <div className="w-full">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
        Select Category
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {CATEGORIES.map((cat) => {
          const isSelected = value === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onChange(cat.slug)}
              className={[
                'flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 transition-all duration-150 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10',
              ].join(' ')}
              aria-pressed={isSelected}
              aria-label={cat.label}
            >
              <span className="text-2xl leading-none select-none" role="img" aria-hidden="true">
                {cat.emoji}
              </span>
              <span
                className={[
                  'text-xs font-medium text-center leading-tight',
                  isSelected
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300',
                ].join(' ')}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
      {value && (
        <p className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
          ✓ Selected:{' '}
          <span className="font-semibold">
            {CATEGORIES.find((c) => c.slug === value)?.label}
          </span>
        </p>
      )}
    </div>
  );
}
