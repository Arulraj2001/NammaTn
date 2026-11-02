// scripts/youtube/pipelines/generate-gk-masterclass.mjs
/**
 * VizhiTN Autonomous Daily 18-20 Minute TNPSC GK Masterclass Pipeline (16:9 Long-Form)
 * "Travel & Learn Audio Storytelling Masterclass" (பயணத்தின் போதே படியுங்கள்)
 * 100% Grounded in Tamil Nadu State Board (TNSCERT Samacheer Kalvi) Textbooks.
 * Warm Light Studio Visuals, Crayon Stickman Props, Audio Ducking & Chapter Timestamps.
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import { getMasterclassTopicForDay, getTodayMasterclassTopic } from '../engine/tnpsc-syllabus-catalog.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleLongFormVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri, getStickmanAssetDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, setYouTubeThumbnail } from '../engine/youtube-client.mjs';
import { synthesizeGeminiSpeech } from '../engine/gemini-tts.mjs';
import { recordBroadcastSuccess, isBroadcastCompletedToday } from '../engine/broadcast-logger.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

function getPythonBinary() {
  for (const bin of ['python', 'python3']) {
    try {
      const ver = execSync(`${bin} --version`, { stdio: 'pipe', timeout: 5000 }).toString().trim();
      if (ver.startsWith('Python')) return bin;
    } catch {}
  }
  return 'python';
}

async function synthesizeSpeech(text, outputPath, voice = 'ta-IN-ValluvarNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Google Gemini Lifelike Neural Voice
  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[MASTERCLASS TTS] Synthesizing via Google Gemini Voice: "${cleanText.slice(0, 45)}..."`);
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'karthik' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        console.log(`[MASTERCLASS TTS ✓] Gemini speech generated: ${path.basename(outputPath)}`);
        return outputPath;
      }
    } catch (geminiErr) {
      console.warn(`[MASTERCLASS TTS WARN] Gemini TTS unavailable (${geminiErr.message}). Seamlessly falling back to Edge-TTS...`);
    }
  }

  // 2. Microsoft Edge-TTS Fallback
  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const args = ['-m', 'edge_tts', '--voice', voice, '--rate=+2%', '--file', tempTextFile, '--write-media', outputPath];
    execFileSync(python, args, { stdio: 'pipe', timeout: 60000, windowsHide: true });
    console.log(`[MASTERCLASS TTS ✓] Edge-TTS speech generated: ${path.basename(outputPath)}`);
  } finally {
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch (_) {}
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error(`TTS synthesis failed to write file: ${outputPath}`);
  }
  return outputPath;
}

/**
 * Builds Chapter Audio Scripts tailored for immersive travel listening & exam mastery
 */
function buildMasterclassChapterScripts(topic, isFastMode = false) {
  if (isFastMode) {
    // Fast mode for quick test runs & CI smoke tests (~25-35s per chapter)
    return [
      {
        chapterNum: 1,
        titleTa: 'அத்தியாயம் 1: வரலாற்றுப் பின்னணியும் முதல் எதிர்ப்பும் (1755)',
        timelineYear: '1755',
        keyEntity: 'கர்னல் ஹெரான் & மாபூஸ்கான்',
        scriptTa: `வணக்கம் டி.என்.பி.எஸ்.சி தேர்வர்களே! விழிTN பொது அறிவு வழிகாட்டிக்கு உங்களை அன்போடு வரவேற்கிறோம். இன்று நாம் யூனிட் 8-ன் மிக முக்கியமான பாடம்: பூலித்தேவர் வரலாறு மற்றும் நெற்கட்டும்செவல் போரை ஆழமாக கற்கப் போகிறோம். 1755-ஆம் ஆண்டு ஆற்காடு நவாப் முகமது அலி ஆங்கிலேய கிழக்கிந்திய கம்பெனிக்கு வரி வசூலிக்கும் உரிமையை வழங்கினார். கர்னல் ஹெரான் தலைமையில் மாபூஸ்கான் நெல்லைக்கு வரி வசூலிக்க வந்தார். ஆனால் ஒரு ரூபாய் கூட வரி கொடுக்க மாட்டேன் என்று நெஞ்சை நிமிர்த்தி நின்ற முதல் இந்திய மன்னன் பூலித்தேவர்.`
      },
      {
        chapterNum: 2,
        titleTa: 'அத்தியாயம் 2: களக்காடு போர் & பாளையக்காரர் கூட்டமைப்பு (முதல் வெற்றி)',
        timelineYear: '1755 - களக்காடு',
        keyEntity: 'சிங்கம்பட்டி & ஊத்துமலை பாளையங்கள்',
        scriptTa: `அத்தியாயம் இரண்டு: வரலாற்றுச் சிறப்புமிக்க களக்காடு போர். பூலித்தேவர் ஆங்கிலேயருக்கு எதிராக பாளையக்காரர்களின் முதல் கூட்டமைப்பை உருவாக்கினார். இதில் ஊத்துமலை, சிங்கம்பட்டி, சேத்தூர், நடுவக்குறிச்சி பாளையங்கள் இணைந்தன. ஆனால் சிவகிரி, எட்டயபுரம் மற்றும் பாஞ்சாலங்குறிச்சி இணைய மறுத்தன. திருவிதாங்கூர் மன்னரின் 4000 படை வீரர்களின் உதவியுடன் களக்காடு போரில் மாபூஸ்கானின் படைகளை பூலித்தேவர் சிதறடித்தார். ஆங்கிலேயருக்கு எதிரான முதல் மிகப்பெரிய வெற்றி இதுவே!`
      },
      {
        chapterNum: 3,
        titleTa: 'அத்தியாயம் 3: யூசுப் கானின் வருகையும் நெற்கட்டும்செவல் வீழ்ச்சியும் (1759-1761)',
        timelineYear: '1759 - 1761',
        keyEntity: 'கான் சாகிப் (யூசுப் கான்)',
        scriptTa: `அத்தியாயம் மூன்று: யூசுப் கானின் வருகை. ஆங்கிலேய கிழக்கிந்திய கம்பெனி கான் சாகிப் என்று அழைக்கப்பட்ட யூசுப் கானை அனுப்பியது. திருச்சியிலிருந்து கொண்டுவரப்பட்ட நவீன பீரங்கிகள் மூலம் நெற்கட்டும்செவல் கோட்டை முற்றுகையிடப்பட்டது. 1761 மே 16 அன்று பூலித்தேவரின் மூன்று முக்கிய கோட்டைகளான நெற்கட்டும்செவல், வாசுதேவநல்லூர் மற்றும் பனையூர் யூசுப் கானின் கட்டுப்பாட்டுக்குள் வந்தன. பூலித்தேவர் தலைமறைவானார்.`
      },
      {
        chapterNum: 4,
        titleTa: 'அத்தியாயம் 4: பூலித்தேவரின் மறுவருகையும் கேப்டன் கேம்ப்பெல் போரும் (1764-1767)',
        timelineYear: '1764 - 1767',
        keyEntity: 'கேப்டன் கேம்ப்பெல்',
        scriptTa: `அத்தியாயம் நான்கு: பூலித்தேவரின் மீள்வருகை. 1764-ல் ஆங்கிலேயருக்கு துரோகம் இழைத்ததாக கூறி யூசுப் கான் தூக்கிலிடப்பட்டார். இதை பயன்படுத்திய பூலித்தேவர் நெற்கட்டும்செவல் கோட்டையை மீண்டும் கைப்பற்றினார். ஆனால் 1767-ல் பிரிட்டிஷ் தளபதி கேப்டன் கேம்ப்பெல் மீண்டும் கோட்டையை முற்றுகையிட்டு கைப்பற்றினார். பூலித்தேவர் சங்கரன்கோவிலில் மறைந்து சுதந்திரப் போராட்ட வரலாற்றில் நீங்காப் புகழ் பெற்றார்.`
      },
      {
        chapterNum: 5,
        titleTa: 'அத்தியாயம் 5: டி.என்.பி.எஸ்.சி முந்தைய ஆண்டு வினாக்கள் & சமச்சீர் குறிப்புகள்',
        timelineYear: 'முக்கிய வினாக்கள்',
        keyEntity: 'சமச்சீர் கல்வி 10th & 11th',
        scriptTa: `அத்தியாயம் ஐந்து: தேர்வுக்கான ரிவிஷன் வினாக்கள்! கேள்வி ஒன்று: நெற்கட்டும்செவல் கோட்டையை கேப்டன் கேம்ப்பெல் கைப்பற்றிய ஆண்டு எது? விடை: 1767. கேள்வி இரண்டு: பூலித்தேவரின் கூட்டமைப்பில் இணைய மறுத்த பாளையம் எது? விடை: சிவகிரி. தினமும் மாலையில் இதுபோல பயணத்தின் போதே கற்க விழிTN சேனலை சப்ஸ்கிரைப் செய்து கொள்ளுங்கள். நன்றி, வாழ்த்துகள்!`
      }
    ];
  }

  // Full Production 18-20 Minute Masterclass Audio Storytelling
  return [
    {
      chapterNum: 1,
      titleTa: 'அத்தியாயம் 1: வரலாற்றுப் பின்னணியும் முதல் எதிர்ப்பும் (1755)',
      timelineYear: '1755',
      keyEntity: 'கர்னல் ஹெரான் & மாபூஸ்கான்',
      scriptTa: `வணக்கம் டி.என்.பி.எஸ்.சி மற்றும் அரசுப் பணித் தேர்வர்களே! விழிTN பொது அறிவு வழிகாட்டியின் 18 நிமிட ஆடியோ மாஸ்டர் கிளாஸ் தொடருக்கு உங்களை அன்போடு வரவேற்கிறோம்.

நீங்கள் பேருந்திலோ ரயிலிலோ பயணம் செய்துகொண்டிருக்கலாம் அல்லது மாலை நேர நடைப்பயிற்சியில் இருக்கலாம். இந்த 18 நிமிடங்களை முழு கவனத்தோடு கேளுங்கள். தமிழ்நாடு பாடநூல் கழகத்தின் பத்தாம் வகுப்பு சமூக அறிவியல் அலகு 6 மற்றும் பதினொன்றாம் வகுப்பு வரலாற்றுப் புத்தகத்தை அணுவணுவாக அலசி, தேர்வு வினாக்களை உங்கள் மனதில் பதிய வைக்கப் போகிறோம்.

இன்றைய தலைப்பு: யூனிட் 8-ன் மிக முக்கியமான பாடம் — ஆங்கிலேய கிழக்கிந்திய கம்பெனியை அலறவிட்ட முதல் விடுதலைப் போராட்ட வீரர், நெற்கட்டும்செவல் பாளையக்காரர் பூலித்தேவரின் முழு வரலாறு.

இதன் வரலாற்றுப் பின்னணியை முதலில் புரிந்துகொள்வோம்.
பதினெட்டாம் நூற்றாண்டின் நடுப்பகுதியில், 1750-களில் ஆற்காடு நவாப் பதவிக்காக முகமது அலிக்கும் சந்தா சாகிபுக்கும் இடையே வாரிசு உரிமைப் போர் நடந்தது. இதில் முகமது அலி ஆங்கிலேய கிழக்கிந்திய கம்பெனியின் ஆதரவோடு ஆட்சியைப் பிடித்தார். ஆனால் அதற்காக ஆங்கிலேயர்களுக்கு பெரும் கடன் தொகையை தரவேண்டி இருந்தது. கடனைத் தீர்க்க முடியாத ஆற்காடு நவாப் முகமது அலி, திருநெல்வேலி உள்ளிட்ட தென் பாளையங்களில் நேரடியாக வரி வசூலிக்கும் உரிமையை கிழக்கிந்திய கம்பெனிக்கு தாரைவார்த்துக் கொடுத்தார்.

1755-ஆம் ஆண்டு மார்ச் மாதம், கர்னல் அலெக்சாண்டர் ஹெரான் தலைமையில், ஆற்காடு நவாபின் அண்ணன் மாபூஸ்கான் துணையுடன் ஒரு பெரும் பிரிட்டிஷ் படை நெல்லைச் சீமையை நோக்கிப் புறப்பட்டது. பல பாளையக்காரர்கள் பயந்துபோய் கப்பம் கட்டினர். ஆனால் நெற்கட்டும்செவல் பாளையத்தின் சிங்கமாக விளங்கிய பூலித்தேவர் கர்ஜித்தார்: "வானம் பொழிகிறது, பூமி விளைகிறது. நாங்கள் பரம்பரை பரம்பரையாக ஆண்ட இந்த மண்ணுக்கு வெள்ளைக்காரனுக்கு எதற்கு கப்பம் கட்ட வேண்டும்? ஒரு நெல் மணி கூட கப்பமாக கொடுக்க மாட்டோம்!" என்று துணிச்சலாக அறிவித்தார். இதனால் கோபமடைந்த கர்னல் ஹெரான் நெற்கட்டும்செவலை தாக்க முயன்றார். ஆனால் போதுமான பீரங்கிகள் இல்லாததாலும், வீரர்களுக்கு ஊதியம் கொடுக்கப் பணம் இல்லாததாலும் ஹெரானால் பூலித்தேவரை ஒன்றும் செய்ய முடியவில்லை. ஆங்கிலேயப் படை பின்வாங்கிச் சென்றது. கம்பெனி நிர்வாகம் ஹெரானை பணியில் இருந்தே நீக்கியது. இதுதான் பூலித்தேவரின் முதல் முழக்கம்!`
    },
    {
      chapterNum: 2,
      titleTa: 'அத்தியாயம் 2: களக்காடு போர் & பாளையக்காரர் கூட்டமைப்பு (முதல் வெற்றி)',
      timelineYear: '1755 - களக்காடு',
      keyEntity: 'சிங்கம்பட்டி & ஊத்துமலை பாளையங்கள்',
      scriptTa: `இப்போது நாம் அத்தியாயம் இரண்டுக்கு வருகிறோம்: களக்காடு போர் மற்றும் பாளையக்காரர் கூட்டமைப்பு. தேர்வு நோக்கில் இந்த அத்தியாயத்திலிருந்து கேட்கப்படாத வினாத்தாளே இல்லை எனலாம்.

ஹெரான் பின்வாங்கிய பிறகு, ஆற்காடு நவாப் தன் சகோதரர் மாபூஸ்கானுக்கு கூடுதல் குதிரைப்படைகளையும் கம்பெனி துருப்புகளையும் வழங்கி நெல்லையை முழுமையாகக் கட்டுப்படுத்த உத்தரவிட்டார்.

இதை உணர்ந்த பூலித்தேவர் ஒரு வரலாற்று ராஜதந்திர முடிவை எடுத்தார். ஆங்கிலேயர்களை தனித்து நின்று வெல்ல முடியாது என்று கணித்த அவர், தென் தமிழகத்தில் இருந்த பாளையக்காரர்களை ஒன்றிணைத்து முதல் கூட்டமைப்பை உருவாக்கினார்.

சமச்சீர் கல்வி புத்தகத்தில் மிகத் தெளிவாகக் குறிப்பிடப்பட்டுள்ள இந்த விவரங்களை நன்கு குறித்துக் கொள்ளுங்கள்:
பூலித்தேவரின் இந்த சுதந்திரக் கூட்டமைப்பில் மேற்கு பாளையங்களான ஊத்துமலை, தலைவன்கோட்டை, நடுவக்குறிச்சி, சிங்கம்பட்டி, சேத்தூர், சுரண்டை, மற்றும் கொல்லம்கொண்டான் ஆகிய பாளையங்கள் உடனே இணைந்தன.

ஆனால் மூன்று முக்கியமான பாளையங்கள் இதில் இணைய மறுத்தன! அவை எவை தெரியுமா?
ஒன்று சிவகிரி, இரண்டு எட்டயபுரம், மூன்று கட்டபொம்மனின் பாஞ்சாலங்குறிச்சி. இந்த மூன்று பாளையங்களும் கம்பெனிக்கு ஆதரவான போக்கையே கடைப்பிடித்தன. தேர்வு வினாவில் "பூலித்தேவர் கூட்டணியில் இணையாத பாளையம் எது?" என்று பலமுறை கேட்டுள்ளார்கள். சிவகிரி தான் சரியான விடை.

பூலித்தேவர் இத்தோடு நிற்கவில்லை. மைசூரின் ஹைதர் அலி மற்றும் பாண்டிச்சேரியின் பிரெஞ்சுக்காரர்களுக்கும் தூது அனுப்பினார். ஆனால் ஹைதர் அலியும் பிரெஞ்சுக்காரர்களும் அப்போது மராத்தியர்களோடு கடும் போரில் ஈடுபட்டிருந்ததால் அவர்களால் உதவ முடியவில்லை.

இந்தச் சூழலில், திருவிதாங்கூர் மன்னருடன் பூலித்தேவர் நட்பு உடன்படிக்கை செய்து கொண்டார். திருவிதாங்கூர் மன்னர் 4000 தேர்ந்த வீரர்களை பூலித்தேவருக்கு ஆதரவாக அனுப்பி வைத்தார்.

1755-ல் வரலாற்றுச் சிறப்புமிக்க களக்காடு போர் மூண்டது. மாபூஸ்கானின் 1000 கம்பெனி சிப்பாய்களும், கர்நாடகப் படைகளும் களக்காட்டில் பூலித்தேவரின் கூட்டமைப்புப் படைகளை எதிர்கொண்டன. பூலித்தேவரின் போர் வியூகத்தின் முன்னால் மாபூஸ்கானின் படைகள் நிலைகுலைந்து ஓடின. மாபூஸ்கான் போர்க்களத்தை விட்டு தப்பியோடினார். இந்திய விடுதலைப் போராட்ட வரலாற்றில், ஆங்கிலேயக் கம்பெனிப் படைகளை போர்க்களத்தில் நேருக்கு நேர் மோதி சிதறடித்த முதல் தென்னிந்திய மன்னர் பூலித்தேவர் என்ற வரலாற்றுப் பொன்னெழுத்துக்கள் இங்கேதான் பதிக்கப்பட்டன!`
    },
    {
      chapterNum: 3,
      titleTa: 'அத்தியாயம் 3: யூசுப் கானின் வருகையும் நெற்கட்டும்செவல் வீழ்ச்சியும் (1759-1761)',
      timelineYear: '1759 - 1761',
      keyEntity: 'கான் சாகிப் (யூசுப் கான்)',
      scriptTa: `அத்தியாயம் மூன்று: யூசுப் கானின் வருகை மற்றும் நெற்கட்டும்செவல் முற்றுகை.

களக்காடு தோல்விக்குப் பிறகு, கிழக்கிந்திய கம்பெனி அதிர்ந்து போனது. இனி சாதாரண தளபதிகளை அனுப்பினால் வேலைக்கு ஆகாது என்று முடிவு செய்து, அன்றைய காலகட்டத்தில் ராணுவ நுணுக்கங்களில் மிகச் சிறந்த வீரராகத் திகழ்ந்த கான் சாகிப் என்று அழைக்கப்பட்ட மருதநாயகம் என்ற யூசுப் கானை களமிறக்கியது.

யூசுப் கான் அவசரப்பட்டு போருக்கு வரவில்லை. பூலித்தேவரை வெல்ல வேண்டுமானால் இரண்டு விஷயங்கள் தேவை என்பதை அவர் அறிந்திருந்தார்: ஒன்று, நவீன கனரக பீரங்கிகள். இரண்டு, பூலித்தேவரின் கூட்டமைப்பை உடைப்பது.

திருச்சியிலிருந்து கனரக பீரங்கிகள் வரும் வரை யூசுப் கான் பொறுமையாகக் காத்திருந்தார். அதே நேரத்தில் திருவிதாங்கூர் மன்னரிடம் பேச்சுவார்த்தை நடத்தி, அவரை பூலித்தேவரின் கூட்டணியில் இருந்து பிரித்தார்.

1760 செப்டம்பரில் திருச்சியிலிருந்து கனரக பீரங்கிகள் நெல்லைக்கு வந்து சேர்ந்தன. யூசுப் கான் நெற்கட்டும்செவல் கோட்டையை முழுமையாக சுற்றி வளைத்தார். பல மாதங்கள் கொட்டும் மழையிலும் பீரங்கி குண்டுகளின் முழக்கத்திலும் நெற்கட்டும்செவல் மண் அதிர்ந்தது. பூலித்தேவரின் வீரர்கள் இணையற்ற வீரத்தோடு கோட்டையைக் காத்தனர்.

ஆனால் நவீன பீரங்கிகளின் தாக்குதலால் கோட்டையின் சுவர்கள் இடிந்து விழுந்தன. 1761 மே 16 அன்று — இந்த தேதியை நினைவில் வையுங்கள், மே 16, 1761 — பூலித்தேவரின் மூன்று முக்கிய கோட்டைகளான நெற்கட்டும்செவல், வாசுதேவநல்லூர் மற்றும் பனையூர் யூசுப் கானின் வசமானது.

கோட்டை வீழ்ந்தாலும் பூலித்தேவர் சிறைப்படவில்லை. அவர் தப்பித்து தலைமறைவானார். தன் தாய்மண்ணை மீட்கும் கனவோடு காடுகளிலும் மலைகளிலும் புதிய படைகளைத் திரட்டத் தொடங்கினார்.`
    },
    {
      chapterNum: 4,
      titleTa: 'அத்தியாயம் 4: பூலித்தேவரின் மறுவருகையும் கேப்டன் கேம்ப்பெல் போரும் (1764-1767)',
      timelineYear: '1764 - 1767',
      keyEntity: 'கேப்டன் கேம்ப்பெல்',
      scriptTa: `அத்தியாயம் நான்கு: பூலித்தேவரின் மீள்வருகையும் கேப்டன் கேம்ப்பெல் போரும்.

வரலாறு பல விசித்திரமான திருப்பங்களை கொண்டது. பூலித்தேவரை வீழ்த்திய யூசுப் கான், ஆங்கிலேய கம்பெனி அதிகாரிகளோடு முரண்பட்டு, சுயாட்சி அறிவிக்க முயன்றார். ஆற்காடு நவாப் கம்பெனியிடம் சதி செய்து, யூசுப் கான் துரோகம் இழைத்ததாக குற்றம் சாட்டினார். 1764-ஆம் ஆண்டு யூசுப் கான் கம்பெனி அரசால் தூக்கிலிடப்பட்டார்.

யூசுப் கானின் மரணச் செய்தி நெல்லை சீமையை எட்டிய அடுத்த வினாடி, தலைமறைவாக இருந்த சிங்கம் மீண்டும் பாய்ந்தது! 1764-ல் பூலித்தேவர் தன் நம்பிக்கைக்குரிய வீரர்களுடன் வந்து, நெற்கட்டும்செவல் கோட்டையை மீண்டும் மீட்டு தன் சுதந்திரக் கொடியை ஏற்றினார். மூன்று ஆண்டுகள் நெற்கட்டும்செவலை தன் கட்டுப்பாட்டில் வைத்திருந்தார்.

ஆனால் ஆங்கிலேய கிழக்கிந்திய கம்பெனி இதை அமைதியாகப் பார்த்துக் கொண்டிருக்கவில்லை. 1767-ஆம் ஆண்டு, கொடூரமான பிரிட்டிஷ் தளபதியான கேப்டன் கேம்ப்பெல் தலைமையில் ஒரு புதிய பெரும் படை நெற்கட்டும்செவலை நோக்கி அனுப்பப்பட்டது.

கேம்ப்பெல் நவீன போர்க்கருவிகளுடன் கோட்டையைத் தாக்கினார். கடுமையான சண்டைக்குப் பின், 1767-ல் நெற்கட்டும்செவல் கோட்டை கேப்டன் கேம்ப்பெல்லால் மீண்டும் கைப்பற்றப்பட்டது.

இதன் பிறகு பூலித்தேவர் என்ன ஆனார் என்பது வரலாற்று மர்மமாகவே உள்ளது. அவர் சங்கரன்கோவில் கோமதி அம்மன் சன்னதிக்குள் சென்று மறைந்துவிட்டார் என்றும், எதிரிகளின் கைகளில் சிக்காமல் வீரமரணம் அடைந்தார் என்றும் வாய்மொழி வரலாறுகள் கூறுகின்றன. ஆனால் ஆங்கிலேயருக்கு ஒருபோதும் தலைவணங்காத வீரத்தின் அடையாளமாக பூலித்தேவரின் பெயர் வரலாற்றின் பக்கங்களில் அழியாமல் நிலைத்துவிட்டது.`
    },
    {
      chapterNum: 5,
      titleTa: 'அத்தியாயம் 5: டி.என்.பி.எஸ்.சி முந்தைய ஆண்டு வினாக்கள் & சமச்சீர் குறிப்புகள்',
      timelineYear: 'தேர்வு வினாக்கள் & ரிவிஷன்',
      keyEntity: 'சமச்சீர் கல்வி 10th & 11th',
      scriptTa: `இப்போது நாம் அத்தியாயம் ஐந்துக்கு வருகிறோம்: டி.என்.பி.எஸ்.சி முந்தைய ஆண்டு வினாக்கள் மற்றும் சமச்சீர் கல்வி மீள்நோக்கு! இந்த 2 நிமிடங்களை மிகக் கூர்மையாக கவனியுங்கள்.

முதல் கேள்வி:
நெற்கட்டும்செவல் கோட்டையை இறுதியாக கேப்டன் கேம்ப்பெல் கைப்பற்றிய ஆண்டு எது?
ஆப்ஷன் A: 1761, ஆப்ஷன் B: 1764, ஆப்ஷன் C: 1767, ஆப்ஷன் D: 1755.
சரியான விடை: ஆப்ஷன் C, 1767. 1761-ல் யூசுப் கான் பிடித்தார், 1767-ல் கேம்ப்பெல் பிடித்தார். குழப்பிக் கொள்ளாதீர்கள்.

இரண்டாவது கேள்வி:
பூலித்தேவருக்கு ஆதரவளிக்காத மேற்கு அல்லது கிழக்கு பாளையம் எது?
ஆப்ஷன் A: ஊத்துமலை, ஆப்ஷன் B: சிவகிரி, ஆப்ஷன் C: சிங்கம்பட்டி, ஆப்ஷன் D: சேத்தூர்.
சரியான விடை: ஆப்ஷன் B, சிவகிரி.

மூன்றாவது கேள்வி:
ஆங்கிலேய கம்பெனி படைகளை 1755-ல் களக்காடு போரில் பூலித்தேவர் யாருடைய 4000 படை வீரர்கள் உதவியுடன் தோற்கடித்தார்?
சரியான விடை: திருவிதாங்கூர் மன்னர்!

நினைவில் வைக்க வேண்டிய சூத்திரம்:
1755: ஹெரான் தோல்வி மற்றும் களக்காடு போர்.
1761: யூசுப் கான் கோட்டையைக் கைப்பற்றுதல்.
1764: யூசுப் கான் தூக்கு மற்றும் பூலித்தேவர் மீட்சி.
1767: கேப்டன் கேம்ப்பெல் இறுதி வெற்றி.

நண்பர்களே, நாளைய 18 நிமிட மாஸ்டர் கிளாஸில் அலகு 8-ன் அடுத்த மாபெரும் அத்தியாயம்: "வீரமங்கை வேலு நாச்சியார், மருது சகோதரர்கள் மற்றும் குயிலியின் தியாக வரலாறு" பற்றி விரிவாகப் பார்க்கப் போகிறோம்.

பயணத்தின் போதே படித்து டி.என்.பி.எஸ்.சி தேர்வில் முதல் முயற்சியிலேயே வெற்றி பெற, உடனே விழிTN யூடியூப் சேனலை சப்ஸ்கிரைப் செய்து பெல் பட்டனை கிளிக் செய்து வையுங்கள்! உங்கள் நண்பர்களுக்கும் பகிருங்கள். அரசு வேலை உங்கள் வசமாகட்டும்! நன்றி, வணக்கம்!`
    }
  ];
}

/**
 * Renders Warm Light Studio 16:9 Presentation Slides (1920x1080)
 */
function generateMasterclassSlideHtml({
  topic,
  chapter,
  brandLogoDataUri
}) {
  const teacherCrayon = getStickmanAssetDataUri('book-study-crayon.png');
  const targetCrayon = getStickmanAssetDataUri('target-crayon.png');
  const clockCrayon = getStickmanAssetDataUri('clock-crayon.png');
  const checkCrayon = getStickmanAssetDataUri('check-crayon.png');

  // Chapter steps navigation
  const navDots = [1, 2, 3, 4, 5].map(stepNum => {
    const isActive = stepNum === chapter.chapterNum;
    const isCompleted = stepNum < chapter.chapterNum;
    return `
      <div class="step-node ${isActive ? 'step-active' : (isCompleted ? 'step-done' : '')}">
        <span class="step-num">${isCompleted ? '✓' : stepNum}</span>
        <span class="step-label">அத்தியாயம் ${stepNum}</span>
      </div>
    `;
  }).join('<div class="step-line"></div>');

  return `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: #FAF8F5;
      font-family: 'Noto Sans Tamil', 'Plus Jakarta Sans', system-ui, sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 48px 64px;
      color: #1E293B;
    }

    /* Ambient Warm Studio Accents */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#E2E8F0 1.5px, transparent 1.5px);
      background-size: 36px 36px;
      opacity: 0.6;
      pointer-events: none;
    }

    /* Top Navigation Header */
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 20px;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.5px;
    }
    .badge-unit {
      background: #0D9488;
      color: #FFFFFF;
      font-size: 16px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .geo-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #F1F5F9;
      border: 1.5px solid #CBD5E1;
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 18px;
      font-weight: 700;
      color: #475569;
    }

    /* Progress Tracker Bar */
    .progress-bar-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 18px 0 24px 0;
      z-index: 10;
      gap: 12px;
    }
    .step-node {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 2px solid #CBD5E1;
      padding: 8px 16px;
      border-radius: 30px;
      color: #64748B;
      font-weight: 800;
      font-size: 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }
    .step-node.step-active {
      background: #0D9488;
      border-color: #0D9488;
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(13,148,136,0.3);
      transform: scale(1.04);
    }
    .step-node.step-done {
      background: #F0FDF4;
      border-color: #10B981;
      color: #047857;
    }
    .step-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .step-active .step-num {
      background: #FFFFFF;
      color: #0D9488;
      font-weight: 900;
    }
    .step-line {
      width: 30px;
      height: 2px;
      background: #E2E8F0;
    }

    /* Main Content Body (2 Columns) */
    .content-body {
      display: flex;
      flex: 1;
      gap: 40px;
      z-index: 10;
      align-items: stretch;
    }

    /* Left Narrative Column */
    .narrative-col {
      flex: 1.25;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #FFFFFF;
      border-radius: 24px;
      padding: 40px 48px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.04);
      border: 1.5px solid #E2E8F0;
    }
    .chapter-heading {
      font-size: 38px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.3;
      margin-bottom: 24px;
    }
    .highlight-card {
      background: #F8FAFC;
      border-left: 6px solid #0D9488;
      padding: 24px 28px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .highlight-title {
      font-size: 20px;
      font-weight: 800;
      color: #0D9488;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .highlight-body {
      font-size: 24px;
      font-weight: 700;
      color: #334155;
      line-height: 1.5;
    }

    .source-box {
      background: #FEF3C7;
      border: 1.5px solid #FDE68A;
      border-radius: 12px;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .source-badge-text {
      font-size: 18px;
      font-weight: 800;
      color: #92400E;
    }

    /* Right Memory & Stickman Column */
    .visual-col {
      flex: 0.75;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .visual-card {
      background: #FFFFFF;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.04);
      border: 1.5px solid #E2E8F0;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex: 1;
      justify-content: center;
    }
    .stickman-img {
      width: 180px;
      height: 180px;
      object-fit: contain;
      margin-bottom: 20px;
      filter: drop-shadow(0 6px 12px rgba(0,0,0,0.06));
    }
    .timeline-pill {
      background: #EFF6FF;
      border: 1.5px solid #BFDBFE;
      color: #1D4ED8;
      font-size: 22px;
      font-weight: 800;
      padding: 8px 20px;
      border-radius: 9999px;
      margin-bottom: 12px;
    }
    .entity-title {
      font-size: 22px;
      font-weight: 900;
      color: #0F172A;
      margin-bottom: 6px;
    }
    .mnemonic-box {
      background: #FFF1F2;
      border: 1.5px solid #FECDD3;
      border-radius: 16px;
      padding: 20px 24px;
      width: 100%;
      text-align: left;
    }
    .mnemonic-title {
      font-size: 18px;
      font-weight: 800;
      color: #E11D48;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .mnemonic-text {
      font-size: 18px;
      font-weight: 700;
      color: #4C0519;
      line-height: 1.4;
    }

    /* Footer Audio Hook */
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      border-top: 2px solid #E2E8F0;
      padding-top: 18px;
    }
    .audio-hook {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 800;
      color: #475569;
    }
    .audio-icon-pulse {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #0D9488;
      box-shadow: 0 0 10px #0D9488;
    }
    .sub-prompt {
      font-size: 20px;
      font-weight: 900;
      color: #0F172A;
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>

  <!-- Top Header -->
  <div class="top-header">
    <div class="brand-wrap">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="brand-logo" alt="VizhiTN">` : ''}
      <div class="brand-title">VizhiTN பொது அறிவு வழிகாட்டி</div>
      <div class="badge-unit">TNPSC அலகு 8 • நாள் ${topic.dayNumber}</div>
    </div>
    <div class="geo-pill">
      <span>📍</span>
      <span>${topic.districtRegion}</span>
    </div>
  </div>

  <!-- Progress Bar (5 Steps) -->
  <div class="progress-bar-container">
    ${navDots}
  </div>

  <!-- Main Content Body -->
  <div class="content-body">
    <!-- Left Column: Rich Narrative & Exam Highlight -->
    <div class="narrative-col">
      <div class="chapter-heading">${chapter.titleTa}</div>

      <div class="highlight-card">
        <div class="highlight-title">
          ${targetCrayon ? `<img src="${targetCrayon}" style="width:24px;height:24px;" alt="Target">` : '🎯'}
          <span>பாடத்தின் முதன்மை நிகழ்வு:</span>
        </div>
        <div class="highlight-body">
          ${chapter.chapterNum === 5 
            ? 'முந்தைய ஆண்டு அசல் TNPSC வினாக்கள் & சமச்சீர் கல்வி பக்கக் குறிப்புகள்.'
            : (topic.historicalTimeline[chapter.chapterNum - 1]?.event || topic.samacheerKeyFacts[chapter.chapterNum - 1] || topic.storyHookTa)}
        </div>
      </div>

      <div class="source-box">
        ${checkCrayon ? `<img src="${checkCrayon}" style="width:24px;height:24px;" alt="Source">` : '📖'}
        <div class="source-badge-text">அங்கீகரிக்கப்பட்ட மூலம்: ${topic.standardSource}</div>
      </div>
    </div>

    <!-- Right Column: Visual Crayon & Memory Formula -->
    <div class="visual-col">
      <div class="visual-card">
        ${teacherCrayon ? `<img src="${teacherCrayon}" class="stickman-img" alt="Teacher Stickman">` : ''}
        <div class="timeline-pill">காலக்கோடு: ${chapter.timelineYear}</div>
        <div class="entity-title">${chapter.keyEntity}</div>

        <div class="mnemonic-box">
          <div class="mnemonic-title">
            ${clockCrayon ? `<img src="${clockCrayon}" style="width:20px;height:20px;" alt="Clock">` : '💡'}
            <span>நினைவில் வைக்க:</span>
          </div>
          <div class="mnemonic-text">${topic.mnemonicTa}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer-bar">
    <div class="audio-hook">
      <div class="audio-icon-pulse"></div>
      <span>🎧 பயணத்தின் போதே கேளுங்கள் (Audio Storytelling Masterclass)</span>
    </div>
    <div class="sub-prompt">🔔 தினமும் மாலை 7:30 மணிக்கு முழு வகுப்பு</div>
  </div>
</body>
</html>`;
}

/**
 * Generates high-converting 16:9 Thumbnail for the Masterclass
 */
async function generateMasterclassThumbnail({
  topic,
  outputPath,
  brandLogoDataUri
}) {
  const teacherCrayon = getStickmanAssetDataUri('book-study-crayon.png');
  const targetCrayon = getStickmanAssetDataUri('target-crayon.png');

  const html = `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@800;900&family=Plus+Jakarta+Sans:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1280px;
      height: 720px;
      overflow: hidden;
      background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%);
      font-family: 'Noto Sans Tamil', 'Plus Jakarta Sans', system-ui, sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 44px 56px;
      color: #0F172A;
    }
    .thumb-grid {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(#D97706 1.5px, transparent 1.5px);
      background-size: 32px 32px;
      opacity: 0.15;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
    }
    .brand-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #FFFFFF;
      border: 2px solid #E2E8F0;
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 20px;
      font-weight: 900;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .brand-logo-img {
      width: 36px;
      height: 36px;
      border-radius: 8px;
    }
    .exam-badge {
      background: #DC2626;
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 900;
      padding: 10px 24px;
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(220,38,38,0.25);
      letter-spacing: 0.5px;
    }

    .main-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
      gap: 30px;
    }
    .left-text {
      flex: 1.3;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .duration-pill {
      align-self: flex-start;
      background: #0D9488;
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 900;
      padding: 8px 20px;
      border-radius: 8px;
    }
    .giant-title {
      font-size: 52px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.25;
      text-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .sub-hook {
      font-size: 30px;
      font-weight: 800;
      color: #B45309;
    }

    .right-graphic {
      flex: 0.7;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .stickman-thumb {
      width: 250px;
      height: 250px;
      object-fit: contain;
      filter: drop-shadow(0 8px 20px rgba(0,0,0,0.12));
    }
    .badge-sure-shot {
      background: #FFFFFF;
      border: 3px solid #0D9488;
      color: #0D9488;
      font-size: 20px;
      font-weight: 900;
      padding: 8px 20px;
      border-radius: 9999px;
      margin-top: 10px;
      box-shadow: 0 6px 14px rgba(13,148,136,0.15);
    }

    .bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      background: #FFFFFF;
      border: 2px solid #E2E8F0;
      border-radius: 16px;
      padding: 14px 28px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }
    .source-text {
      font-size: 20px;
      font-weight: 800;
      color: #475569;
    }
    .cta-text {
      font-size: 22px;
      font-weight: 900;
      color: #DC2626;
    }
  </style>
</head>
<body>
  <div class="thumb-grid"></div>

  <div class="top-bar">
    <div class="brand-pill">
      ${brandLogoDataUri ? `<img src="${brandLogoDataUri}" class="brand-logo-img" alt="Logo">` : ''}
      <span>VizhiTN பொது அறிவு வழிகாட்டி</span>
    </div>
    <div class="exam-badge">TNPSC அலகு 8 • நாள் ${topic.dayNumber}</div>
  </div>

  <div class="main-body">
    <div class="left-text">
      <div class="duration-pill">🎧 18 நிமிடம் முழு ஆடியோ பாடம்</div>
      <div class="giant-title">${topic.topicTitleTa.split(':')[0]}</div>
      <div class="sub-hook">${topic.storyHookTa.slice(0, 75)}...</div>
    </div>
    <div class="right-graphic">
      ${teacherCrayon ? `<img src="${teacherCrayon}" class="stickman-thumb" alt="Stickman">` : ''}
      <div class="badge-sure-shot">✓ 100% சமச்சீர் கல்வி</div>
    </div>
  </div>

  <div class="bottom-bar">
    <div class="source-text">📖 10th & 11th Std சமச்சீர் கல்வி | Group 4 & 2 Sure Shot</div>
    <div class="cta-text">பயணத்தின் போதே கேளுங்கள் ➔</div>
  </div>
</body>
</html>`;

  await renderHtmlToImage(html, outputPath, { width: 1280, height: 720 });
  return outputPath;
}

// ─── MAIN RUNNER ─────────────────────────────────────────────────────────────
async function main() {
  console.log('====================================================');
  console.log('VizhiTN 18-20m TNPSC GK Audio Masterclass Engine');
  console.log('====================================================');

  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isFastMode = args.includes('--fast') || isDryRun;
  const dayArg = args.find(a => a.startsWith('--day='))?.split('=')[1];

  const todayIst = new Date().toISOString().split('T')[0];

  // Deduplication check
  if (!args.includes('--force') && !isDryRun) {
    const status = await isBroadcastCompletedToday('gk-masterclass', todayIst);
    if (status.published) {
      console.log(`[MASTERCLASS GUARD ✓] Masterclass already broadcast today (${status.existingRecord?.youtube_video_id || 'recorded'}). Exiting.`);
      process.exit(0);
    }
  }

  // Pick Syllabus Lesson
  const topic = dayArg ? getMasterclassTopicForDay(parseInt(dayArg, 10)) : getTodayMasterclassTopic();
  console.log(`[SYLLABUS TOPIC] Day ${topic.dayNumber}: "${topic.topicTitleTa}"`);
  console.log(`[SOURCE] ${topic.standardSource}`);
  console.log(`[EXECUTION MODE] ${isFastMode ? 'FAST MODE / DRY-RUN' : 'FULL 18-MINUTE PRODUCTION'}`);

  const sessionDir = path.resolve(`scripts/youtube/assets/masterclass_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();

  // Step 1: Synthesize Chapters
  const chapterDefinitions = buildMasterclassChapterScripts(topic, isFastMode);
  const chapters = [];

  console.log(`\n[STEP 1/3] Generating audio narration & slides for ${chapterDefinitions.length} chapters...`);

  for (let idx = 0; idx < chapterDefinitions.length; idx++) {
    const ch = chapterDefinitions[idx];
    console.log(`\n--- [CHAPTER ${ch.chapterNum}/5] ${ch.titleTa} ---`);

    // Audio
    const audioPath = path.join(sessionDir, `ch_${ch.chapterNum}_audio.mp3`);
    await synthesizeSpeech(ch.scriptTa, audioPath);
    const durSec = getAudioDuration(audioPath);
    console.log(`[CH ${ch.chapterNum} AUDIO OK] Duration: ${durSec.toFixed(1)}s`);

    // Slide
    const slideHtml = generateMasterclassSlideHtml({
      topic,
      chapter: ch,
      brandLogoDataUri
    });
    const slidePath = path.join(sessionDir, `ch_${ch.chapterNum}_slide.png`);
    await renderHtmlToImage(slideHtml, slidePath, { width: 1920, height: 1080 });
    console.log(`[CH ${ch.chapterNum} SLIDE OK] Rendered 1080p slide.`);

    chapters.push({
      slidePath,
      audioPath,
      durationSec: Math.ceil(durSec) + 1
    });
  }

  // Step 2: Assemble Video
  console.log('\n[STEP 2/3] Assembling 16:9 Long-Form Masterclass Video...');
  const outputVideoPath = path.join(sessionDir, `TNPSC_Unit8_Day${topic.dayNumber}_${topic.id}.mp4`);
  assembleLongFormVideo({ chapters, outputPath: outputVideoPath });
  console.log(`[MASTERCLASS VIDEO OK] Rendered: ${outputVideoPath}`);

  // Step 3: Generate Thumbnail
  console.log('\n[STEP 3/3] Generating High-CTR Warm Studio 16:9 Thumbnail...');
  const thumbnailPath = path.join(sessionDir, `TNPSC_Unit8_Day${topic.dayNumber}_Thumb.png`);
  await generateMasterclassThumbnail({ topic, outputPath: thumbnailPath, brandLogoDataUri });
  console.log(`[THUMBNAIL OK] Generated: ${thumbnailPath}`);

  // Video SEO Metadata
  const videoTitle = `${topic.topicTitleTa} | TNPSC Group 4 & 2 Unit 8 Masterclass`;
  const videoDescription = `TNPSC அலகு 8 (Unit 8) — 18 நிமிட ஆடியோ கதை மாஸ்டர்கிளாஸ் (Travel & Learn Series)\n\nதலைப்பு: ${topic.topicTitleTa}\nநாள்: ${topic.dayNumber} / 30 நாள் பாடத்திட்டம்\nஅங்கீகரிக்கப்பட்ட மூலம்: ${topic.standardSource}\n\nஅத்தியாயங்கள் (Chapter Timestamps):\n00:00 அத்தியாயம் 1: வரலாற்றுப் பின்னணியும் முதல் எதிர்ப்பும் (1755)\n03:00 அத்தியாயம் 2: களக்காடு போர் & பாளையக்காரர் கூட்டமைப்பு (முதல் வெற்றி)\n07:30 அத்தியாயம் 3: யூசுப் கானின் வருகையும் நெற்கட்டும்செவல் வீழ்ச்சியும் (1759-1761)\n12:00 அத்தியாயம் 4: பூலித்தேவரின் மறுவருகையும் கேப்டன் கேம்ப்பெல் போரும் (1764-1767)\n16:00 அத்தியாயம் 5: டி.என்.பி.எஸ்.சி முந்தைய ஆண்டு வினாக்கள் & சமச்சீர் குறிப்புகள்\n\n📌 இந்த வீடியோவின் முக்கியத்துவம்:\nபயணத்தின் போதோ (Bus, Train) அல்லது நடைப்பயிற்சியின் போதோ முழு கவனத்தோடு கேட்டு டி.என்.பி.எஸ்.சி தேர்வுக்கு தயாராகலாம்.\n\nதினமும் மாலை 7:30 மணிக்கு அடுத்த பாடம் வெளியிடப்படும்.\nஇப்போதே VizhiTN சேனலை Subscribe செய்து கொள்ளுங்கள்!\n\n#TNPSC #TNPSCUnit8 #TNPSCGroup4 #TNPSCGroup2 #TamilNaduHistory #PuliThevar #SamacheerKalvi #VizhiTN`;

  if (isDryRun) {
    console.log('\n--- [DRY RUN PREVIEW] ---');
    console.log(`Title: ${videoTitle}`);
    console.log(`Video File: ${outputVideoPath}`);
    console.log(`Thumbnail File: ${thumbnailPath}`);
    console.log('[SUCCESS ✓] GK Masterclass pipeline verified successfully.');
    return;
  }

  // Upload to YouTube
  console.log('\n[UPLOADING] Uploading GK Masterclass to YouTube...');
  const uploadResult = await uploadToYouTube({
    videoPath: outputVideoPath,
    title: videoTitle,
    description: videoDescription,
    tags: ['TNPSC', 'TNPSC Group 4', 'TNPSC Group 2', 'Unit 8', 'Tamil Nadu History', 'Puli Thevar', 'Samacheer Kalvi', 'VizhiTN'],
    categoryId: '27' // Education
  });

  if (uploadResult?.id) {
    console.log(`[YOUTUBE UPLOAD ✓] Published Video ID: ${uploadResult.id}`);
    await setYouTubeThumbnail(uploadResult.id, thumbnailPath);
    console.log('[YOUTUBE THUMBNAIL ✓] High-CTR thumbnail set successfully.');

    await recordBroadcastSuccess({
      format: 'gk-masterclass',
      title: videoTitle,
      youtubeVideoId: uploadResult.id,
      broadcastDate: todayIst,
      metadata: {
        topic_id: topic.id,
        day_number: topic.dayNumber,
        standard_source: topic.standardSource,
        thumbnail_path: thumbnailPath
      }
    });
  }
}

main().catch(err => {
  console.error('[FATAL MASTERCLASS ERROR]:', err);
  process.exit(1);
});
