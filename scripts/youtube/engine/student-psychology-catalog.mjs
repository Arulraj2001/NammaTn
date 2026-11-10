// scripts/youtube/engine/student-psychology-catalog.mjs
/**
 * VizhiTN Student Discipline & Cognitive Trigger Catalog
 * Grounded in Cognitive Psychology, Active Recall, Habit Science (James Clear),
 * and Regret Aversion specifically tailored for Tamil Nadu competitive exam aspirants
 * (TNPSC Group 4, Group 2, VAO, Sub-Inspector, Police, TET).
 * 
 * Strict Anti-Slop Policy:
 * - NO generic "wake up at 4 AM" shouting
 * - NO hollow motivational quotes
 * - Direct, authentic, respectful, spoken Tamil (ta-IN)
 * - Identifies the exact behavioral trap -> explains why the brain fails -> delivers 1 micro-action
 */

export const STUDENT_PSYCHOLOGY_TOPICS = [
  {
    id: 'mindset-01-active-recall',
    category: 'active-recall',
    titleTa: 'படித்தது ஏன் உடனே மறந்து போகிறது?',
    titleEn: 'Why You Forget What You Study (The Active Recall Reality Check)',
    hookTa: '6 மணி நேரம் படிச்சுட்டு அடுத்த நாள் ஒண்ணுமே ஞாபகம் இல்லையா? தப்பு உங்க மூளையில இல்ல... நீங்க படிச்ச விதத்துல.',
    hookEn: 'Studied for 6 hours and remember nothing tomorrow? The flaw is not in your brain—it is how you studied.',
    scriptTa: 'புத்தகத்தை திறந்து வச்சுக்கிட்டு ஹைலைட்டர்ல எல்லா வரிகளையும் கலர் பண்றதுக்கு பேரு படிப்பு இல்ல. அதுக்கு பேரு இலூஷன் ஆஃப் காம்பிடென்ஸ் (Illusion of Competence). அதாவது படிச்ச மாதிரி மூளைக்கு ஒரு போலி திருப்தி. இன்றிலிருந்து ஒரு எளிய விதியை பின்பற்றுங்கள். 20 நிமிடம் படியுங்கள். பிறகு புத்தகத்தை மூடி வைத்துவிட்டு, ஒரு வெற்றுத் தாளில் நினைவில் உள்ள 3 முக்கிய குறிப்புகளை எழுதுங்கள். எழுதும்போது ஏற்படும் அந்த மன அழுத்தம் தான் உங்கள் நினைவாற்றலை நிரந்தரமாக்கும். வாசிப்பதை நிறுத்துங்கள்... எழுதிப் பாருங்கள்.',
    actionStepTa: 'இன்றே ஒரு வெற்றுத் தாளை எடுத்து, நீங்கள் படித்த கடைசி பாடத்தின் 3 முக்கிய பாயிண்டுகளை எழுதிப் பாருங்கள்.',
    targetExam: 'TNPSC Group 4 & Group 2',
    pixabayQueries: ['highlighter book study', 'writing notes desk close up', 'focused student library'],
    tags: ['#TNPSC', '#TNPSCGroup4', '#ActiveRecall', '#StudyTips', '#TamilNadu', '#Shorts']
  },
  {
    id: 'mindset-02-afternoon-slump',
    category: 'dopamine-reset',
    titleTa: 'மதிய நேர சோம்பேறித்தனத்தை முறியடிக்கும் 2 நிமிட உத்தி',
    titleEn: 'The 2:30 PM Post-Lunch Slump Destroyer',
    hookTa: 'மதியம் 2:30 மணி. சோறு தின்னுட்டு போனை கையில எடுத்தீங்க... 5 நிமிஷம்னு ஆரம்பிச்ச ஸ்க்ரோலிங் இப்போ 40 நிமிஷம் ஆச்சா?',
    hookEn: 'It is 2:30 PM. You picked up your phone for 5 minutes after lunch—and 40 minutes vanished into scrolling.',
    scriptTa: 'உங்களுக்கு தூக்கம் வரல. உங்க மூளை சோம்பேறித்தனத்துல ஒரு ஈஸியான டோபமைன் (Dopamine) வலையில சிக்கியிருக்கு. இந்த ஒரு நிமிஷம் தான் உங்க வெற்றிக்கும் தோல்விக்கும் உள்ள இடைவெளி. இப்பவே இந்த போனை தலைகீழா டேபிள்ல வைங்க. பாத்ரூம் போய் முகத்துல குளிர்ந்த தண்ணி அடிங்க. 10 முறை தோப்புக்கரணம் போடுங்க. பிறகு டேபிளுக்கு வந்து, TNPSC-ல வரப்போற ஒரே ஒரு சிறிய தலைப்பை மட்டும் 25 நிமிஷம் படியுங்கள். சோம்பேறியாக தூங்குபவர்கள் ஆயிரக்கணக்கானோர்... அதை முறியடித்து படிப்பவரே அதிகாரி.',
    actionStepTa: 'போனை தலைகீழாக வைத்துவிட்டு, குளிர்ந்த நீரில் முகம் கழுவி உடனே 25 நிமிட டைமரை ஆன் செய்யுங்கள்.',
    targetExam: 'TNPSC Group 4 / Police SI',
    pixabayQueries: ['smartphone scrolling hand', 'water splash face fresh', 'antique clock ticking desk'],
    tags: ['#TNPSC', '#AfternoonSlump', '#Discipline', '#TNPSCGroup4', '#TamilMotivation', '#Shorts']
  },
  {
    id: 'mindset-03-officer-identity',
    category: 'identity-shift',
    titleTa: 'மாணவராக அல்ல... அதிகாரியாக படியுங்கள்!',
    titleEn: 'Stop Studying Like a Student. Study Like an Officer.',
    hookTa: 'நீங்க இன்னும் டிஎன்பிஎஸ்சி பாஸ் பண்ணாத ஒரு சாதாரண மாணவர் இல்ல... அடுத்த வருஷம் தாலுகாவுல உட்காரப்போற ஒரு அதிகாரி.',
    hookEn: 'You are not just an insecure aspirant. You are an officer taking charge of a taluk office next year.',
    scriptTa: 'எக்ஸாம் பாஸ் பண்ணனும்னு பயந்து பயந்து படிக்கிற வரைக்கும் புத்தகத்தை பார்த்தாலே சலிப்பு தான் வரும். ஆனால் ஜேம்ஸ் கிளியர் சொல்லும் அடையாள மாற்றம் (Identity Shift) உங்களை மாற்றும். அடுத்த வருஷம் உங்க கிராமத்து மக்கள் தங்கள் குறைகளோடு உங்களிடம் வரப்போகிறார்கள். அந்த நாற்காலியில் அமரப்போகும் ஒரு அதிகாரி எப்படி பொறுப்போடு படிப்பாரோ, அப்படி படியுங்கள். ஒரு அதிகாரி சோம்பேறியா ரீல்ஸ் பார்க்க மாட்டார். உங்கள் நாற்காலி உங்களுக்காக தயாராக இருக்கிறது. எழுந்து அமர்ந்து உங்கள் கடமையை செய்யுங்கள்.',
    actionStepTa: 'உங்கள் ஸ்டடி டேபிளில் "கிராம நிர்வாக அதிகாரி (VAO)" என்று எழுதி வையுங்கள். அதிகாரியின் கம்பீரத்தோடு படியுங்கள்.',
    targetExam: 'TNPSC VAO & Group 4',
    pixabayQueries: ['government office desk stamp', 'tamil nadu collectorate building', 'signing document pen fountain'],
    tags: ['#TNPSCVAO', '#Group4', '#IdentityShift', '#TamilDiscipline', '#TNPSC2026', '#Shorts']
  },
  {
    id: 'mindset-04-regret-aversion',
    category: 'regret-aversion',
    titleTa: '0.5 மார்க்கில் போகும் வலியும்... இன்றைய ஒழுக்கமும்',
    titleEn: 'The Pain of 0.5 Mark Cutoff vs The Discipline of Today',
    hookTa: 'படிக்கும் போது வர்ற அலுப்பு சில மணி நேரம் தான். ஆனா கட்-ஆஃப்ல 0.5 மார்க்ல வேலை போற வலி... பல வருஷம் நெஞ்சுல எரியும்.',
    hookEn: 'The boredom of studying lasts a few hours. The agony of losing a government post by 0.5 mark burns for years.',
    scriptTa: 'இன்னைக்கு சோம்பேறித்தனப்பட்டு நீங்க விட்டு வைக்கிற அந்த ஒரு சிறிய பாலிட்டி அட்டவணை... தேர்வு ஹால்ல 182-வது கேள்வியா வந்து நிக்கும். அப்போ கண்ணு முன்னாடி நான்கு ஆப்ஷன்களும் ஒரே மாதிரி இருக்கும். அன்னைக்கு 10 நிமிஷம் எக்ஸ்ட்ரா படிச்சிருக்கலாமேன்னு அழுது புலம்பினாலும் காலம் திரும்ப வராது. ஒழுக்கத்தின் கசப்பு சில மணித்துளிகள்... வருத்தத்தின் வலி வாழ்நாள் முழுவதும். அடுத்த முறை சோம்பேறித்தனம் வரும்போது, அந்த 0.5 மார்க் வலியை நினைத்துப் பாருங்கள். உடனே படிக்கத் தொடங்குங்கள்.',
    actionStepTa: 'இன்று நீங்கள் தள்ளிப்போட நினைத்த ஒரு கடினமான பாடத்தை இப்போதே 15 நிமிடம் படித்து முடியுங்கள்.',
    targetExam: 'TNPSC Group 4 & Group 2',
    pixabayQueries: ['examination hall students tense', 'stressed thinking head hands', 'clock night silence desk'],
    tags: ['#TNPSCCutoff', '#TNPSCGroup4', '#RegretAversion', '#TamilDiscipline', '#GovernmentJob', '#Shorts']
  },
  {
    id: 'mindset-05-one-page-habit',
    category: 'micro-habits',
    titleTa: 'மொத்த சிலபஸையும் பார்த்து பயப்படாதீர்கள்! 1-பக்க உத்தி',
    titleEn: 'Defeating Syllabus Overwhelm (The 1-Page Micro-Habit)',
    hookTa: '10 சமச்சீர் புத்தகங்களையும், 200 மார்க் சிலபஸையும் பார்த்து மலைத்துப்போய் உட்கார்ந்திருக்கிறீர்களா?',
    hookEn: 'Staring at ten thick Samacheer textbooks and feeling completely paralyzed?',
    scriptTa: 'முழு மலையையும் பார்த்தால் யாருக்குமே பயம் வரும். மூளை அதை பெரிய சுமையா நினைச்சு தப்பிச்சு ஓடப்பார்க்கும். அதனால தான் போனை எடுத்து பார்க்க தோணுது. ஒரு ரகசியம் தெரியுமா? வெற்றியாளர்கள் ஒரே நாளில் சிலபஸை முடிக்கவில்லை. ஒரு நாளைக்கு 10 மணி நேரம் படிக்க வேண்டும் என்று இலக்கு வைக்காதீர்கள். அடுத்த 15 நிமிடம்... ஒரே ஒரு பக்கத்தை மட்டும் முழு கவனத்தோடு படியுங்கள். அந்த ஒரு பக்கம் முடிந்ததும் அடுத்த பக்கம் தானாக நகரும். ஆயிரம் மைல் பயணமும் ஒற்றை அடியில் தான் தொடங்குகிறது.',
    actionStepTa: 'இப்போது புத்தகத்தை திறந்து ஒரே ஒரு பக்கத்தை மட்டும் முழுமையாக படித்து முடியுங்கள். வெற்றி அங்கே தொடங்குகிறது.',
    targetExam: 'All TN Competitive Exams',
    pixabayQueries: ['open book pages turning library', 'mountain sunrise path footsteps', 'desk lamp focus night'],
    tags: ['#StudyHabits', '#TNPSC', '#MicroHabits', '#AtomicHabitsTamil', '#TNPSCPreparation', '#Shorts']
  },
  {
    id: 'mindset-06-phone-another-room',
    category: 'friction-design',
    titleTa: 'போனை பக்கத்தில் வைத்து படிப்பது பெட்ரோல் பக்கத்தில் நெருப்பு வைப்பது போன்றது!',
    titleEn: 'The "Phone in Another Room" Protocol',
    hookTa: 'போனை பக்கத்துல வச்சுக்கிட்டு படிக்கிறது, பெட்ரோல் பக்கத்துல தீக்குச்சி கொளுத்தி வைக்கிற மாதிரி.',
    hookEn: 'Keeping your phone on your study desk is like lighting a match next to open petrol.',
    scriptTa: 'ஹார்வர்ட் பல்கலைக்கழக ஆய்வின்படி, போன் சைலன்ட்டில் இருந்தாலும் உங்கள் மேஜையில் இருந்தால் மூளையின் கவனத்திறன் 20 சதவீதம் குறைகிறது. ஏனெனில் உங்கள் ஆழ்மனம் எப்போது நோட்டிபிகேஷன் வரும் என்று எதிர்பார்த்துக் கொண்டே இருக்கும். இன்றிலிருந்து ஒரு கண்டிப்பான விதி: நீங்கள் படிக்கும் அறைக்குள் உங்கள் ஸ்மார்ட்போன் வரக்கூடாது. அதை அடுத்த அறையில் வையுங்கள். உங்கள் மேஜையில் புத்தகம், பேனா, தண்ணீர் பாட்டில் மட்டுமே இருக்க வேண்டும். போன் இல்லாத 2 மணி நேர கவனம், 6 மணி நேர மேலோட்டமான படிப்பை விட வலிமையானது.',
    actionStepTa: 'இப்போதே எழுந்து உங்கள் போனை பக்கத்து அறையில் சார்ஜரில் போட்டுவிட்டு படிக்க அமருங்கள்.',
    targetExam: 'TNPSC Aspirants',
    pixabayQueries: ['smartphone desk distance silence', 'deep focus student studying candle', 'minimalist study space desk'],
    tags: ['#PhoneAddiction', '#DeepWorkTamil', '#TNPSC', '#FocusHacks', '#StudyDiscipline', '#Shorts']
  },
  {
    id: 'mindset-07-mock-test-fear',
    category: 'fear-extinguisher',
    titleTa: 'மார்க் குறைவாக வரும் என்று டெஸ்ட் எழுத பயப்படுகிறீர்களா?',
    titleEn: 'Why Low Mock Test Marks Are Your Greatest Asset',
    hookTa: 'மார்க் கம்மியா வந்திடும்னு பயந்து ஓஎம்ஆர் டெஸ்ட் எழுதாம தள்ளிப்போடுறீங்களா?',
    hookEn: 'Delaying OMR mock tests because you are terrified of seeing a low score?',
    scriptTa: 'வீட்டில் மாதிரித் தேர்வு எழுதி 100-க்கு 50 மார்க் வாங்கினால் யாரும் உங்களை அவமானப்படுத்த மாட்டார்கள். ஆனால் வீட்டில் தவறு செய்ய பயந்து டெஸ்ட் எழுதாமல் போனால், அதே தவறை டிஎன்பிஎஸ்சி தேர்வு ஹாலில் செய்வீர்கள். அங்கு ஒரு தவறு செய்தால் உங்கள் கனவு பறிபோகும். மாதிரித் தேர்வு என்பது மார்க் வாங்குவதற்கு அல்ல... உங்கள் பலவீனங்களை கண்டறிவதற்கான கருவி. தவறுகளை கொண்டாடுங்கள். ஒவ்வொரு தவறான விடையும் தேர்வு ஹாலில் உங்களுக்கு கிடைக்கப்போகும் ஒரு கூடுதல் மார்க்.',
    actionStepTa: 'இன்றே 50 கேள்விகள் கொண்ட ஒரு மாதிரித் தேர்வை எழுதி, உங்கள் தவறுகளை குறித்து வையுங்கள்.',
    targetExam: 'TNPSC Group 4 & SI',
    pixabayQueries: ['omr sheet pencil shading exam', 'marking paper red pen correction', 'confidence student exam ready'],
    tags: ['#MockTest', '#TNPSCGroup4', '#OMRTest', '#ExamFear', '#TamilMotivation', '#Shorts']
  },
  {
    id: 'mindset-08-sleep-memory',
    category: 'cognitive-science',
    titleTa: 'இரவு தூக்கத்தை கெடுத்து படிப்பது மிகப்பெரிய தவறா?',
    titleEn: 'The Sleep & Memory Consolidation Law',
    hookTa: 'இரவு முழுக்க தூங்காம படிச்சா எல்லாம் மண்டையில ஏறும்னு நினைக்கிறீங்களா? அறிவியல் என்ன சொல்லுது தெரியுமா?',
    hookEn: 'Think staying awake all night cramming guarantees retention? Science proves the exact opposite.',
    scriptTa: 'நீங்கள் பகலில் படிக்கும் தகவல்கள் மூளையின் தற்காலிக சேமிப்பில் மட்டுமே இருக்கும். நீங்கள் தூங்கும்போது தான் மூளையின் ஹிப்போகாம்பஸ் அந்த தகவல்களை நிரந்தர நினைவாக (Long-term memory) மாற்றுகிறது. 7 மணி நேர ஆழ்ந்த தூக்கம் இல்லையென்றால், நீங்கள் படித்த அனைத்தும் காலையில் அழிந்துவிடும். தூக்கத்தை தியாகம் செய்து படிப்பது, ஓட்டை வாளியில் தண்ணீர் நிரப்புவது போன்றது. பகலில் முழு கவனத்துடன் படியுங்கள்... இரவில் குற்ற உணர்ச்சி இல்லாமல் நிம்மதியாக தூங்குங்கள். ஒழுக்கம் என்பது தூக்கத்திலும் இருக்க வேண்டும்.',
    actionStepTa: 'தினமும் இரவு 10:30 மணிக்குள் படுக்கைக்குச் சென்று 7 மணி நேரம் ஆழ்ந்து உறங்குங்கள். காலையில் நினைவாற்றல் இருமடங்காகும்.',
    targetExam: 'All Competitive Exams',
    pixabayQueries: ['peaceful night stars window', 'calm sleeping head rest', 'sunrise dawn morning fresh'],
    tags: ['#SleepScience', '#MemoryHacks', '#TNPSC', '#BrainHealth', '#StudyHabits', '#Shorts']
  }
];

/**
 * Returns today's psychological topic using date rotation or requested slot
 */
export function getMindsetTopicForSlot(slot = 'auto', topicIndex = null) {
  if (topicIndex !== null && topicIndex >= 0 && topicIndex < STUDENT_PSYCHOLOGY_TOPICS.length) {
    return STUDENT_PSYCHOLOGY_TOPICS[topicIndex];
  }

  // Day-of-year rotation ensuring daily variety
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  let offset = 0;
  if (slot === 'evening' || slot === 'afternoon') {
    offset = 4; // Shift to another psychological pillar for midday
  }

  const index = (dayOfYear + offset) % STUDENT_PSYCHOLOGY_TOPICS.length;
  return STUDENT_PSYCHOLOGY_TOPICS[index];
}
