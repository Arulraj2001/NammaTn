export const TN_TODAY_CATEGORIES = [
  { value: '', label: 'All Topics', emoji: '📰' },
  { value: 'infrastructure', label: 'Infrastructure', emoji: '🏗️', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { value: 'education', label: 'Education', emoji: '🎓', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  { value: 'healthcare', label: 'Healthcare', emoji: '🏥', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  { value: 'environment', label: 'Environment', emoji: '🌿', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  { value: 'economy', label: 'Economy', emoji: '💰', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
  { value: 'governance', label: 'Governance', emoji: '🏛️', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  { value: 'transport', label: 'Transport', emoji: '🚌', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
  { value: 'agriculture', label: 'Agriculture', emoji: '🌾', color: 'text-lime-600 bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800' },
  { value: 'technology', label: 'Technology', emoji: '💻', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800' },
  { value: 'social', label: 'Social', emoji: '👥', color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800' },
  { value: 'india', label: 'India & Union', emoji: '🇮🇳', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
  { value: 'world', label: 'World & Global', emoji: '🌐', color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' },
  { value: 'general', label: 'General', emoji: '📋', color: 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
];

export const TN_TODAY_CATEGORY_MAP = Object.fromEntries(
  TN_TODAY_CATEGORIES.filter(category => category.value).map(category => [category.value, category]),
);
