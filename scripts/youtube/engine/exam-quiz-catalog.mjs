// scripts/youtube/engine/exam-quiz-catalog.mjs
/**
 * VizhiTN High-Yield TNPSC / SI Exam Question Bank
 * Curated for rapid 5-second interactive countdown quiz Shorts.
 */

export const TNPSC_QUIZ_BANK = [
  {
    id: 'tnpsc-polity-first-woman-judge',
    subject: 'polity',
    subjectLabel: 'இந்திய அரசியலமைப்பு & நீதித்துறை',
    subjectColor: '#8B5CF6',
    questionTa: 'சென்னை உயர்நீதிமன்றத்தின் முதல் பெண் தலைமை நீதிபதியாகப் பணியாற்றியவர் யார்?',
    options: [
      { key: 'A', text: 'நீதிபதி பானுமதி' },
      { key: 'B', text: 'நீதிபதி காந்தா குமாரி பட்நாகர்' },
      { key: 'C', text: 'நீதிபதி இந்திரா பானர்ஜி' },
      { key: 'D', text: 'நீதிபதி பாத்திமா பீவி' }
    ],
    correctKey: 'B',
    explanationTa: '1992-ல் சென்னை உயர்நீதிமன்றத்தின் முதல் பெண் தலைமை நீதிபதியாக காந்தா குமாரி பட்நாகர் பொறுப்பேற்றார்.'
  },
  {
    id: 'tnpsc-history-south-indian-rebellion',
    subject: 'tamil-history',
    subjectLabel: 'தமிழக வரலாறு & விடுதலைப் போராட்டம்',
    subjectColor: '#EF4444',
    questionTa: 'தென்னிந்திய புரட்சி (South Indian Rebellion) நடைபெற்ற ஆண்டு எது?',
    options: [
      { key: 'A', text: '1800 - 1801' },
      { key: 'B', text: '1806' },
      { key: 'C', text: '1857' },
      { key: 'D', text: '1799' }
    ],
    correctKey: 'A',
    explanationTa: 'மருது சகோதரர்கள் தலைமையில் 1800-1801 ஆம் ஆண்டுகளில் தென்னிந்திய புரட்சி ஒருங்கிணைக்கப்பட்டது.'
  },
  {
    id: 'tnpsc-geo-highest-peak',
    subject: 'geography',
    subjectLabel: 'தமிழ்நாடு புவியியல்',
    subjectColor: '#10B981',
    questionTa: 'தமிழ்நாட்டின் மிக உயரமான சிகரம் எது?',
    options: [
      { key: 'A', text: 'ஆனைமுடி' },
      { key: 'B', text: 'தொட்டபெட்டா' },
      { key: 'C', text: 'சேர்வராயன் மலை' },
      { key: 'D', text: 'அகத்தியர் மலை' }
    ],
    correctKey: 'B',
    explanationTa: 'நீலகிரி மலையில் அமைந்துள்ள தொட்டபெட்டா (2,637 மீட்டர்) தமிழ்நாட்டின் மிக உயரமான சிகரமாகும்.'
  },
  {
    id: 'tnpsc-polity-article-gram-sabha',
    subject: 'polity',
    subjectLabel: 'பஞ்சாயத்து ராஜ் & ஊரக வளர்ச்சி',
    subjectColor: '#8B5CF6',
    questionTa: 'கிராம சபை பற்றி குறிப்பிடும் இந்திய அரசியலமைப்பு சட்டப்பிரிவு (Article) எது?',
    options: [
      { key: 'A', text: 'பிரிவு 243A' },
      { key: 'B', text: 'பிரிவு 243B' },
      { key: 'C', text: 'பிரிவு 243C' },
      { key: 'D', text: 'பிரிவு 243D' }
    ],
    correctKey: 'A',
    explanationTa: 'பிரிவு 243A கிராம சபை அமைப்பை உருவாக்குவது மற்றும் அதன் அதிகாரங்களை விளக்குகிறது.'
  },
  {
    id: 'tnpsc-history-veeresalingam-velunachiyar',
    subject: 'tamil-history',
    subjectLabel: 'தமிழக விடுதலைப் போராளிகள்',
    subjectColor: '#EF4444',
    questionTa: 'ஆங்கிலேயருக்கு எதிராக ஆயுதம் ஏந்தி போராடிய முதல் இந்தியப் பெண் விடுதலைப் போராட்ட வீராங்கனை யார்?',
    options: [
      { key: 'A', text: 'ராணி மங்கம்மாள்' },
      { key: 'B', text: 'வீரமங்கை வேலுநாச்சியார்' },
      { key: 'C', text: 'குயிலி' },
      { key: 'D', text: 'ஜான்சி ராணி' }
    ],
    correctKey: 'B',
    explanationTa: '1780-ல் சிவகங்கையை ஆங்கிலேயரிடம் இருந்து மீட்ட வீரமங்கை வேலுநாச்சியார் முதல் பெண் வீராங்கனை ஆவார்.'
  },
  {
    id: 'tnpsc-economy-first-sipcot',
    subject: 'economy',
    subjectLabel: 'தமிழக பொருளாதாரம் & தொழில்',
    subjectColor: '#F59E0B',
    questionTa: 'தமிழ்நாட்டில் முதல் சிப்காட் (SIPCOT) தொழில் வளாகம் எங்கு தொடங்கப்பட்டது?',
    options: [
      { key: 'A', text: 'ஓசூர்' },
      { key: 'B', text: 'ராணிப்பேட்டை' },
      { key: 'C', text: 'ஸ்ரீபெரும்புதூர்' },
      { key: 'D', text: 'தூத்துக்குடி' }
    ],
    correctKey: 'B',
    explanationTa: '1973 ஆம் ஆண்டு ராணிப்பேட்டையில் முதல் சிப்காட் தொழிற்பேட்டை வளாகம் நிறுவப்பட்டது.'
  },
  {
    id: 'tnpsc-science-kalpakkam',
    subject: 'science',
    subjectLabel: 'அறிவியல் & தொழில்நுட்பம்',
    subjectColor: '#06B6D4',
    questionTa: 'கல்பாக்கம் இந்திரா காந்தி அணு ஆராய்ச்சி மையம் (IGCAR) நிறுவப்பட்ட ஆண்டு எது?',
    options: [
      { key: 'A', text: '1965' },
      { key: 'B', text: '1971' },
      { key: 'C', text: '1983' },
      { key: 'D', text: '1990' }
    ],
    correctKey: 'B',
    explanationTa: 'செங்கல்பட்டு மாவட்டம் கல்பாக்கத்தில் 1971-ல் IGCAR மையம் நிறுவப்பட்டது.'
  }
];

export function getQuizQuestionById(id) {
  return TNPSC_QUIZ_BANK.find(q => q.id === id) || null;
}

export function getTodayQuizQuestion(dateStr = null) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % TNPSC_QUIZ_BANK.length;
  return TNPSC_QUIZ_BANK[index];
}

