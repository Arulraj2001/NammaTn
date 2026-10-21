// scripts/youtube/setup-sfx.mjs
// One-time SFX asset downloader for VizhiTN video pipeline.
// Tries CDN download first, then generates synthetically via FFmpeg.
//
// Run: node scripts/youtube/setup-sfx.mjs

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SFX_DIR = path.resolve('scripts/youtube/assets/sfx');
if (!fs.existsSync(SFX_DIR)) fs.mkdirSync(SFX_DIR, { recursive: true });

// 5 SFX assets the pipeline needs — with FFmpeg synthetic fallback for each
const SFX_LIST = [
  {
    filename: 'newsroom-hum.mp3',
    desc: 'Low ambient newsroom hum',
    urls: [
      'https://cdn.freesound.org/previews/399/399934_7037-lq.mp3',
      'https://assets.mixkit.co/active_storage/sfx/2519/2519.mp3'
    ],
    // Soft 60Hz room hum — barely audible under voice
    ffFilter: 'sine=frequency=60:duration=30,volume=0.08,aecho=0.8:0.88:60:0.4,lowpass=f=300'
  },
  {
    filename: 'broadcast-bed.mp3',
    desc: 'Subtle documentary score bed',
    urls: [
      'https://cdn.freesound.org/previews/521/521562_11299357-lq.mp3',
      'https://assets.mixkit.co/active_storage/sfx/2890/2890.mp3'
    ],
    ffFilter: 'sine=frequency=220:duration=60,volume=0.05,aecho=0.7:0.8:120:0.3,lowpass=f=600'
  },
  {
    filename: 'scene-whoosh.mp3',
    desc: 'Bass whoosh for scene transitions',
    urls: [
      'https://cdn.freesound.org/previews/459/459482_9497060-lq.mp3',
      'https://assets.mixkit.co/active_storage/sfx/1/1.mp3'
    ],
    ffFilter: 'sine=frequency=80:duration=1.5,volume=0.7,afade=t=in:ss=0:d=0.1,afade=t=out:st=0.8:d=0.7'
  },
  {
    filename: 'text-click.mp3',
    desc: 'Subtle UI click on text appear',
    urls: [
      'https://cdn.freesound.org/previews/242/242856_4486188-lq.mp3',
      'https://assets.mixkit.co/active_storage/sfx/2571/2571.mp3'
    ],
    ffFilter: 'sine=frequency=1200:duration=0.08,volume=0.5,afade=t=out:st=0.04:d=0.04'
  },
  {
    filename: 'civic-outro-beat.mp3',
    desc: 'Closing bass beat 2s',
    urls: [
      'https://cdn.freesound.org/previews/580/580698_12517458-lq.mp3',
      'https://assets.mixkit.co/active_storage/sfx/2869/2869.mp3'
    ],
    ffFilter: 'sine=frequency=55:duration=2,volume=0.8,afade=t=out:st=1.5:d=0.5'
  }
];

async function tryDownload(urls, destPath) {
  for (const url of urls) {
    try {
      process.stdout.write(`  Trying CDN: ${url.slice(0, 70)}...`);
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(tid);

      if (!res.ok) { console.log(` HTTP ${res.status}`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1500) { console.log(` Too small`); continue; }
      fs.writeFileSync(destPath, buf);
      console.log(` ✓ (${(buf.length / 1024).toFixed(1)} KB)`);
      return true;
    } catch (err) {
      console.log(` ✗ ${err.message.slice(0, 50)}`);
    }
  }
  return false;
}

function ffmpegGenerate(filter, destPath) {
  const candidates = [
    process.env.FFMPEG_PATH,
    'ffmpeg',
    'C:\\ffmpeg\\bin\\ffmpeg.exe',
    'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'
  ].filter(Boolean);

  for (const ff of candidates) {
    try {
      execSync(`"${ff}" -version`, { stdio: 'pipe', timeout: 4000 });
      execSync(
        `"${ff}" -y -f lavfi -i "${filter}" -c:a libmp3lame -b:a 128k "${destPath}"`,
        { stdio: 'pipe', timeout: 20000 }
      );
      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
        console.log(`  ✓ Synthetic SFX generated via FFmpeg (${(fs.statSync(destPath).size / 1024).toFixed(1)} KB)`);
        return true;
      }
    } catch (_) {}
  }
  return false;
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  VizhiTN SFX Setup — One-Time Audio Asset Creator   ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`Directory: ${SFX_DIR}\n`);

  let done = 0;
  let skipped = 0;

  for (const sfx of SFX_LIST) {
    const dest = path.join(SFX_DIR, sfx.filename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
      console.log(`[SKIP] ${sfx.filename} — already exists`);
      skipped++;
      continue;
    }

    console.log(`\n[SFX] ${sfx.filename} — ${sfx.desc}`);
    const dlOk = await tryDownload(sfx.urls, dest);
    if (dlOk) { done++; continue; }

    console.log('  Generating synthetic via FFmpeg...');
    const genOk = ffmpegGenerate(sfx.ffFilter, dest);
    if (genOk) { done++; continue; }

    console.log(`  ⚠ FAILED — manually download to: ${dest}`);
    console.log(`  → https://freesound.org/search/?q=${sfx.desc.split(' ').slice(0, 3).join('+')}`);
  }

  console.log('\n══════════════════════════════════════════════════════');
  const missing = SFX_LIST.filter(s => {
    const p = path.join(SFX_DIR, s.filename);
    return !fs.existsSync(p) || fs.statSync(p).size < 500;
  });

  console.log(`Created: ${done} | Skipped: ${skipped} | Missing: ${missing.length}`);
  if (missing.length === 0) {
    console.log('✅ ALL SFX READY — Music bed + sidechain ducking activates on next video run!');
  } else {
    console.log(`⚠  Still missing: ${missing.map(s => s.filename).join(', ')}`);
    console.log('   → Pipeline runs without music for those assets only.');
  }
  console.log('══════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('[SFX SETUP ERROR]:', err.message);
  process.exit(1);
});