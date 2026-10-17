// scripts/youtube/engine/sfx-generator.mjs
// Procedural Sound Design Synthesizer using FFmpeg native audio generators
// Produces 5 broadcast-quality sound design stems if missing:
// 1. newsroom-hum.mp3    - Low warm ambient newsroom room tone
// 2. scene-whoosh.mp3     - Cinematic bass whoosh for transitions
// 3. helpline-chime.mp3   - Resonant two-tone alert chime
// 4. text-click.mp3       - Subtle tactile UI click
// 5. civic-outro-beat.mp3 - Deep sub-impact stinger for outro

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { getFfmpegBinaryPath } from './video-composer.mjs';

const SFX_DIR = path.resolve('scripts/youtube/assets/sfx');

export function ensureSfxAssetsExist() {
  if (!fs.existsSync(SFX_DIR)) fs.mkdirSync(SFX_DIR, { recursive: true });
  const ffmpeg = getFfmpegBinaryPath();

  const stems = [
    {
      name: 'newsroom-hum.mp3',
      filter: 'anoisesrc=d=60:c=pink:r=44100:a=0.03,lowpass=f=220,volume=0.4'
    },
    {
      name: 'scene-whoosh.mp3',
      filter: 'aevalsrc=sin(2*PI*max(50\\, 380 - 400*t/0.7)*t)*exp(-3.5*t):d=0.7:s=44100,volume=0.85'
    },
    {
      name: 'helpline-chime.mp3',
      filter: 'aevalsrc=(sin(2*PI*880*t)*0.6 + sin(2*PI*1760*t)*0.4)*exp(-5*t):d=0.6:s=44100,volume=0.7'
    },
    {
      name: 'text-click.mp3',
      filter: 'aevalsrc=sin(2*PI*2400*t)*exp(-60*t):d=0.08:s=44100,volume=0.6'
    },
    {
      name: 'civic-outro-beat.mp3',
      filter: 'aevalsrc=(sin(2*PI*max(35\\, 120-100*t)*t)*exp(-2.2*t)*0.85 + sin(2*PI*220*t)*exp(-6*t)*0.25):d=2.0:s=44100,volume=0.9'
    },
    {
      name: 'broadcast-bed.mp3',
      filter: 'aevalsrc=(sin(2*PI*110*t)*0.18 + sin(2*PI*164.81*t)*0.14 + sin(2*PI*220*t)*0.12 + sin(2*PI*293.66*t)*0.08 + sin(2*PI*329.63*t)*0.08)*exp(-0.03*mod(t\\, 8)):d=180:s=44100,lowpass=f=480,volume=0.32'
    }
  ];

  let createdCount = 0;
  for (const s of stems) {
    const target = path.join(SFX_DIR, s.name);
    if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
      try {
        execFileSync(ffmpeg, [
          '-y',
          '-f', 'lavfi',
          '-i', s.filter,
          '-c:a', 'mp3',
          '-b:a', '128k',
          target
        ], { stdio: 'pipe', timeout: 30000 });
        createdCount++;
      } catch (err) {
        console.log(`[SFX WARN] Could not generate ${s.name}: ${err.message}`);
      }
    }
  }

  if (createdCount > 0) {
    console.log(`[SFX GENERATOR ✓] Generated ${createdCount} sound design stems in ${SFX_DIR}`);
  }
}

export const ensureProceduralSfxStems = ensureSfxAssetsExist;

// Auto-run if executed directly
if (process.argv[1]?.endsWith('sfx-generator.mjs')) {
  ensureSfxAssetsExist();
  console.log('SFX generation complete.');
}
