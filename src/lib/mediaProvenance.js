// Generated bot visuals are stored in these media paths. They are useful as
// illustrative artwork, but must never be presented as evidence of an event.
export function isAiGeneratedIllustration(url) {
  const value = String(url || '').toLowerCase();
  return value.includes('/media/editorial/') || value.includes('/media/civic/') ||
    value.includes('/storage/v1/object/public/media/editorial/') ||
    value.includes('/storage/v1/object/public/media/civic/');
}

export function mediaProvenanceLabel(url, language = 'en') {
  if (!isAiGeneratedIllustration(url)) return null;
  return language === 'ta'
    ? 'AI உருவாக்கிய விளக்கப்படம் — நிகழ்வின் புகைப்படம் அல்ல'
    : 'AI-generated illustration — not a photograph of this event';
}
