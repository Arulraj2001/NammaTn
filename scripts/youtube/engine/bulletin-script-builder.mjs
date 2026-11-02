// scripts/youtube/engine/bulletin-script-builder.mjs
/**
 * VizhiTN Autonomous Civic & Development Bulletin Script Builder
 * Builds professional newsroom broadcast scripts with natural Tamil pauses,
 * citizen advisories, official helpline details, and YouTube chapters.
 */

export function buildLongFormBulletinScript(pkg) {
  const { date, tamilDate, events } = pkg;

  // Intro segment
  const introText = `வணக்கம். விழி தமிழ்நாடு 24 மணி நேர மக்கள் செய்தி மற்றும் விழிப்புணர்வு சிறப்புத் தொகுப்பிற்கு வரவேற்கிறோம். இன்று ${tamilDate}. தமிழகத்தின் முக்கிய அரசு அறிவிப்புகள், நலத்திட்டங்கள், மற்றும் பொதுமக்களுக்கான முக்கிய வழிகாட்டல்களை இந்த பதிவில் விரிவாகப் பார்க்கலாம்.`;

  const introSsml = `<speak>${introText}<break time="500ms"/></speak>`;

  // Segments
  const segments = [];
  let runningSeconds = 15; // Intro duration approx 15s

  events.forEach((event, idx) => {
    const segmentNumber = idx + 1;
    const categoryIcon = getCategoryIcon(event.category);

    const segmentTitle = `${categoryIcon} ${event.headline_ta}`;

    const spokenText = `செய்தி எண் ${segmentNumber}: ${event.headline_ta}. <break time="300ms"/> ${event.core_facts_ta} <break time="400ms"/> பொதுமக்கள் கவனத்திற்கு: ${event.exam_pointer_ta || ''} <break time="300ms"/>`;

    // Estimate duration: ~3 words per second in Tamil
    const wordCount = (event.headline_ta + ' ' + event.core_facts_ta + ' ' + (event.exam_pointer_ta || '')).split(/\s+/).length;
    const estimatedDuration = Math.round(wordCount / 2.8) + 3;

    const chapterTimestamp = formatTimestamp(runningSeconds);

    segments.push({
      index: segmentNumber,
      category: event.category,
      categoryLabel: event.category_label,
      headlineTa: event.headline_ta,
      headlineEn: event.headline_en,
      coreFactsTa: event.core_facts_ta,
      examPointerTa: event.exam_pointer_ta,
      recallQuestionTa: event.recall_question_ta,
      sourceName: event.source_name,
      spokenText,
      chapterTimestamp,
      startSeconds: runningSeconds,
      duration: estimatedDuration
    });

    runningSeconds += estimatedDuration;
  });

  // Outro segment
  const outroText = `இன்றைய முக்கிய அறிவிப்புகள் குறித்த உங்கள் கருத்துக்களை கீழே உள்ள கமெண்ட் பகுதியில் பதிவிடுங்கள். நாளைய முக்கிய மக்கள் செய்திகளை உடனுக்குடன் பெற விழி தமிழ்நாடு சேனலை சப்ஸ்கிரைப் செய்து கொள்ளுங்கள். நன்றி, வணக்கம்.`;
  const outroSsml = `<speak>${outroText}</speak>`;

  // Generate YouTube Description with Clickable Chapters & Civic Tags
  const description = buildYouTubeDescription(pkg, segments);
  const title = `தமிழ்நாடு 24 மணி நேர முக்கிய செய்திகள் (${tamilDate}) | அரசு திட்டங்கள் & மக்கள் வழிகாட்டி | Daily 8 PM Bulletin`;

  const tags = [
    'Tamil Nadu News Today',
    'Tamil Nadu Government Schemes',
    `Tamil Nadu News ${tamilDate}`,
    'Daily Civic Bulletin Tamil',
    'Tamil Nadu Public Awareness',
    'Citizen Rights Tamil',
    'VizhiTN'
  ];

  return {
    title,
    description,
    tags,
    introText,
    introSsml,
    outroText,
    outroSsml,
    segments,
    date,
    tamilDate,
    totalDurationEstimated: runningSeconds + 15
  };
}

/**
 * Builds 50-Second Rapid Shorts Script for Daily Civic Updates
 */
export function buildShortsScript(pkg) {
  const { date, tamilDate, events } = pkg;
  const topEvents = events.slice(0, 3);

  const hook = `இன்றைய டாப் 3 மக்கள் செய்திகள்! (${tamilDate}) முக்கிய அரசு அறிவிப்புகள்!`;
  
  const points = topEvents.map((e, i) => `${i + 1}) ${e.headline_ta}`).join('\n\n');

  const fullSpoken = `${hook} <break time="300ms"/> ` +
    topEvents.map((e, i) => `செய்தி ${i + 1}: ${e.headline_ta}.`).join(' <break time="300ms"/> ') +
    ` <break time="300ms"/> முழு விவரங்களை அறிய VizhiTN சப்ஸ்கிரைப் பண்ணுங்க!`;

  const title = `இன்றைய டாப் 3 முக்கிய செய்திகள் (${tamilDate}) | தமிழ்நாடு அரசு அறிவிப்புகள் #Shorts`;

  return {
    title,
    spokenText: fullSpoken,
    points,
    topEvents,
    date,
    tamilDate
  };
}

function getCategoryIcon(cat) {
  const map = {
    government_schemes: '🏛️',
    judiciary_acts: '⚖️',
    economy_industry: '📈',
    appointments_persons: '👤',
    environment_science: '🌿',
    sports_awards: '🏆'
  };
  return map[cat] || '📌';
}

function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function buildYouTubeDescription(pkg, segments) {
  const { date, tamilDate } = pkg;

  let desc = `📢 தமிழ்நாடு 24 மணி நேர மக்கள் செய்தி அறிக்கை — ${tamilDate}\n`;
  desc += `தமிழகத்தின் முக்கிய அரசு திட்டங்கள், நிர்வாக முடிவுகள், மற்றும் மக்கள் விழிப்புணர்வு தொகுப்பு.\n\n`;
  desc += `⏱️ நேர முத்திரைகள் (Chapter Timestamps):\n`;
  desc += `00:00 - அறிமுகம் & முக்கிய செய்திகள்\n`;

  segments.forEach(seg => {
    desc += `${seg.chapterTimestamp} - ${seg.index}. ${seg.headlineTa} (${seg.categoryLabel})\n`;
  });

  desc += `\n──────────────────────────────\n`;
  desc += `📲 VizhiTN அதிகாரப்பூர்வ WhatsApp Channel: https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228\n`;
  desc += `🌐 அதிகாரப்பூர்வ இணையதளம்: https://www.vizhitn.in\n`;
  desc += `🔔 தினசரி மக்கள் செய்திகளைப் பெற Subscribe செய்யுங்கள்!\n\n`;
  desc += `#TamilNaduNews #GovtSchemes #TamilNaduUpdates #CivicTamil #VizhiTN #Shorts`;

  return desc;
}
