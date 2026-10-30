// scripts/youtube/engine/bulletin-script-builder.mjs
/**
 * VizhiTN Autonomous Current Affairs Bulletin Script & Narration Builder
 * Builds professional newsroom broadcast scripts with natural Tamil pauses,
 * TNPSC exam study callouts, interactive quiz prompts, and YouTube chapters.
 */

export function buildLongFormBulletinScript(pkg) {
  const { date, tamilDate, events } = pkg;

  // Intro segment
  const introText = `வணக்கம். விழி தமிழ்நாடு நடப்பு நிகழ்வுகள் சிறப்புத் தொகுப்பிற்கு வரவேற்கிறோம். இன்று ${tamilDate}. கடந்த இருபத்து நான்கு மணி நேரத்தில் தமிழ்நாட்டில் நடைபெற்ற மிக முக்கியமான நடப்பு நிகழ்வுகள் மற்றும் டி.என்.பி.எஸ்.சி போட்டித் தேர்வுகளுக்குத் தேவையான முக்கிய குறிப்புகளை இந்த பதிவில் விரிவாகப் பார்க்கலாம்.`;

  const introSsml = `<speak>${introText}<break time="500ms"/></speak>`;

  // Segments
  const segments = [];
  let runningSeconds = 15; // Intro duration approx 15s

  events.forEach((event, idx) => {
    const segmentNumber = idx + 1;
    const categoryIcon = getCategoryIcon(event.category);

    const segmentTitle = `${categoryIcon} ${event.headline_ta}`;

    const spokenText = `செய்தி எண் ${segmentNumber}: ${event.headline_ta}. <break time="300ms"/> ${event.core_facts_ta} <break time="400ms"/> தேர்வுக்கான முக்கியக் குறிப்பு: ${event.exam_pointer_ta} <break time="300ms"/>`;

    // Estimate duration: ~3 words per second in Tamil
    const wordCount = (event.headline_ta + ' ' + event.core_facts_ta + ' ' + event.exam_pointer_ta).split(/\s+/).length;
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

  // Outro segment with Recall Quiz
  const quizQuestions = events.slice(0, 3).map((e, i) => `${i + 1}) ${e.recall_question_ta}`).join(' <break time="400ms"/> ');
  const outroText = `இன்றைய நடப்பு நிகழ்வுகள் வினாடி வினா: <break time="300ms"/> ${quizQuestions} <break time="400ms"/> இதற்கான சரியான விடைகளை கீழே உள்ள கமெண்ட் பகுதியில் பதிவிடுங்கள். நாளைய நடப்பு நிகழ்வுகளை உடனுக்குடன் பெற விழி தமிழ்நாடு சேனலை சப்ஸ்கிரைப் செய்து கொள்ளுங்கள். நன்றி, வணக்கம்.`;
  const outroSsml = `<speak>${outroText}</speak>`;

  // Generate YouTube Description with Clickable Chapters & Study Tags
  const description = buildYouTubeDescription(pkg, segments);
  const title = `TNPSC Current Affairs Today (${tamilDate}) | தமிழ்நாடு 24 மணி நேர நடப்பு நிகழ்வுகள் | Daily 8 PM Bulletin`;

  const tags = [
    'TNPSC Current Affairs Today',
    'Tamil Nadu Current Affairs',
    `TNPSC Current Affairs ${tamilDate}`,
    'Daily Current Affairs Tamil',
    'TNPSC Group 4 Current Affairs',
    'TNPSC Group 2 Current Affairs',
    'Police SI Exam Current Affairs',
    'Tamil Nadu Government Schemes',
    'DIPR Tamil Nadu News',
    'Madras High Court Judgments',
    'TNPSC Exam Preparation Tamil',
    'VizhiTN Current Affairs',
    'TN Current Affairs 24 Hours',
    'Tamil Current Affairs Quiz'
  ];

  return {
    title,
    description,
    tags,
    date,
    tamilDate,
    totalDurationEstimated: runningSeconds + 20,
    intro: {
      text: introText,
      ssml: introSsml,
      duration: 15
    },
    segments,
    outro: {
      text: outroText,
      ssml: outroSsml,
      duration: 25
    }
  };
}

/**
 * Builds 50-Second Rapid Shorts Script for Daily Exam Prep
 */
export function buildShortsScript(pkg) {
  const { date, tamilDate, events } = pkg;
  const topEvents = events.slice(0, 3);

  const hook = `இன்றைய டாப் 3 நடப்பு நிகழ்வுகள்! (${tamilDate}) தேர்வுக்கு முக்கியமானது!`;
  
  const points = topEvents.map((e, i) => `${i + 1}) ${e.headline_ta} — ${e.exam_pointer_ta}`).join('\n\n');
  const quiz = topEvents[0]?.recall_question_ta || 'சரியான விடையை கமெண்ட் செய்யுங்கள்!';

  const fullSpoken = `${hook} <break time="300ms"/> ` +
    topEvents.map((e, i) => `முதல் செய்தி: ${e.headline_ta}. ${e.exam_pointer_ta}`).join(' <break time="300ms"/> ') +
    ` <break time="300ms"/> இன்றைய கேள்வி: ${quiz}. சரியான விடையை கமெண்ட் பண்ணுங்க! VizhiTN சப்ஸ்கிரைப் பண்ணுங்க!`;

  const title = `இன்றைய டாப் 3 நடப்பு நிகழ்வுகள் (${tamilDate}) | TNPSC Exam Current Affairs #Shorts`;

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

  let desc = `📚 தமிழ்நாடு 24 மணி நேர நடப்பு நிகழ்வுகள் — ${tamilDate}\n`;
  desc += `TNPSC Group 1, Group 2, Group 4, Police SI & Banking தேர்வுகளுக்கான பிரத்யேக தினசரி நடப்பு நிகழ்வுகள் தொகுப்பு.\n\n`;
  desc += `⏱️ பாட வாரியான நேர முத்திரைகள் (Chapter Timestamps):\n`;
  desc += `00:00 - அறிமுகம் & முக்கிய தலைப்புகள்\n`;

  segments.forEach(seg => {
    desc += `${seg.chapterTimestamp} - ${seg.index}. ${seg.headlineTa} (${seg.categoryLabel})\n`;
  });

  desc += `\n❓ இன்றைய சுய மதிப்பீட்டு வினா-விடை (Quiz):\n`;
  segments.slice(0, 3).forEach((seg, i) => {
    desc += `${i + 1}. ${seg.recallQuestionTa}\n`;
  });

  desc += `\n👉 உங்கள் பதில்களை கமெண்ட் பகுதியில் பதிவிடுங்கள்!\n\n`;
  desc += `──────────────────────────────\n`;
  desc += `📲 VizhiTN அதிகாரப்பூர்வ WhatsApp Channel: https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228\n`;
  desc += `🌐 முழு அரசாணை விவரங்கள்: https://www.vizhitn.in\n`;
  desc += `🔔 தினமும் இரவு 8 மணிக்கு நடப்பு நிகழ்வுகளைப் பெற Subscribe செய்யுங்கள்!\n\n`;
  desc += `#TNPSC #TNPSCCurrentAffairs #TamilNaduCurrentAffairs #DailyCurrentAffairsTamil #TNPSCGroup4 #PoliceExam #VizhiTN`;

  return desc;
}

