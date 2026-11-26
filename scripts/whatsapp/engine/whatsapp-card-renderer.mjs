// scripts/whatsapp/engine/whatsapp-card-renderer.mjs
/**
 * VizhiTN Branded WhatsApp Graphic Card Renderer (1080x1080 PNG)
 * Produces forward-worthy, mobile-readable infographics watermarked with the
 * VizhiTN WhatsApp Channel brand so every group forward drives new organic followers.
 */

import fs from 'fs';
import path from 'path';
import { renderHtmlToImage } from '../../youtube/engine/frame-renderer.mjs';
import { getBrandLogoDataUri } from '../../youtube/engine/brand-assets.mjs';

function escapeHtml(str = '') {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildFooterHtml() {
  return `
    <div style="
      display:flex; justify-content:space-between; align-items:center;
      background:#0f172a; border:2px solid #22c55e; border-radius:20px;
      padding:22px 30px; margin-top:auto;
    ">
      <div style="display:flex; align-items:center; gap:14px;">
        <span style="font-size:34px;">📲</span>
        <div>
          <div style="font-size:24px; font-weight:900; color:#4ade80;">VizhiTN WhatsApp Channel</div>
          <div style="font-size:19px; font-weight:700; color:#cbd5e1;">தினசரி நேரடி எச்சரிக்கை & வேலைவாய்ப்புகளுக்கு Follow செய்யுங்கள்</div>
        </div>
      </div>
      <div style="
        background:#22c55e; color:#052e16; font-size:22px; font-weight:900;
        padding:12px 24px; border-radius:999px; white-space:nowrap;
      ">FOLLOW FREE ↗</div>
    </div>
  `;
}

/**
 * Renders 1080x1080 Statewide Consolidated Power Cut / Holiday Card
 */
export function renderPowerCutDigestCard(digest, outputPath) {
  const logoUri = getBrandLogoDataUri();
  const isHoliday = digest.alertKind === 'holiday';
  const accent = isHoliday ? '#ef4444' : '#f59e0b';
  const badgeText = isHoliday ? '🚨 பள்ளி விடுமுறை அறிவிப்பு' : (digest.mode === 'tomorrow' ? '⚡ நாளை மின்தடை பட்டியல்' : '⚡ இன்றைய மின்தடை பட்டியல்');

  const rowsHtml = (digest.items || []).slice(0, 6).map(item => `
    <div style="
      background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.14);
      border-left:8px solid ${accent}; border-radius:18px; padding:20px 26px;
      display:flex; justify-content:space-between; align-items:center; gap:20px;
    ">
      <div style="flex:1; min-width:0;">
        <div style="font-size:30px; font-weight:900; color:#fef08a; margin-bottom:6px;">📍 ${escapeHtml(item.districtTa)}</div>
        <div style="font-size:24px; font-weight:700; color:#f1f5f9; line-height:1.35;">${escapeHtml(item.areasTa)}</div>
      </div>
      <div style="
        background:rgba(245,158,11,0.16); border:1.5px solid ${accent};
        color:#fde68a; font-size:22px; font-weight:900;
        padding:10px 18px; border-radius:14px; text-align:center; white-space:nowrap;
      ">⏰ ${escapeHtml(item.timingTa || '9 AM - 2 PM')}</div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width:1080px; height:1080px; overflow:hidden;
      background: radial-gradient(circle at 20% 10%, #1e293b 0%, #020617 85%);
      font-family: 'Noto Sans Tamil', system-ui, sans-serif;
      color:#fff; padding:44px 48px; display:flex; flex-direction:column; gap:22px;
    }
  </style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <div style="display:flex; align-items:center; gap:14px;">
      ${logoUri ? `<img src="${logoUri}" style="width:52px; height:52px; border-radius:12px;">` : ''}
      <span style="font-size:30px; font-weight:900; letter-spacing:0.5px;">VizhiTN</span>
    </div>
    <div style="background:${accent}; color:#020617; font-size:24px; font-weight:900; padding:10px 26px; border-radius:999px;">
      ${badgeText} • ${escapeHtml(digest.tamilDate)}
    </div>
  </div>

  <div style="font-size:36px; font-weight:900; color:#ffffff; line-height:1.25;">
    ${escapeHtml(digest.headlineTa || 'தமிழ்நாடு மாவட்ட வாரியான நேரலை அறிவிப்பு')}
  </div>

  <div style="display:flex; flex-direction:column; gap:14px; flex:1; justify-content:center;">
    ${rowsHtml}
  </div>

  <div style="display:flex; justify-content:space-between; align-items:center; font-size:22px; font-weight:800; color:#94a3b8; padding:0 6px;">
    <span>📞 அவசர உதவி எண்: ${escapeHtml(digest.helpline || '1912')} (24x7)</span>
    <span>🔁 உங்கள் நண்பர்கள் & குரூப்பில் பகிரவும்</span>
  </div>

  ${buildFooterHtml()}
</body>
</html>`;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  renderHtmlToImage(html, outputPath, { width: 1080, height: 1080 });
  return outputPath;
}

/**
 * Renders 1080x1080 Verified Job Radar Card
 */
export function renderJobRadarCard(job, outputPath) {
  const logoUri = getBrandLogoDataUri();
  const accent = job.isGovt ? '#38bdf8' : '#a855f7';
  const badgeLabel = job.isGovt ? '🏛️ அரசு வேலைவாய்ப்பு' : '💼 வேலைவாய்ப்பு அறிவிப்பு';

  const html = `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width:1080px; height:1080px; overflow:hidden;
      background: radial-gradient(circle at 80% 15%, #172554 0%, #090d16 80%);
      font-family: 'Noto Sans Tamil', system-ui, sans-serif;
      color:#fff; padding:48px 50px; display:flex; flex-direction:column; gap:24px;
    }
    .row {
      background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.16);
      border-radius:20px; padding:24px 30px; display:flex; align-items:center; gap:20px;
    }
    .lbl { font-size:24px; font-weight:800; color:#94a3b8; min-width:210px; }
    .val { font-size:29px; font-weight:900; color:#f8fafc; flex:1; }
  </style>
</head>
<body>
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <div style="display:flex; align-items:center; gap:14px;">
      ${logoUri ? `<img src="${logoUri}" style="width:52px; height:52px; border-radius:12px;">` : ''}
      <span style="font-size:30px; font-weight:900;">VizhiTN Job Radar</span>
    </div>
    <div style="background:${accent}; color:#020617; font-size:24px; font-weight:900; padding:10px 28px; border-radius:999px;">
      ${badgeLabel} • ${escapeHtml(job.tamilDate)}
    </div>
  </div>

  <div style="background:rgba(56,189,248,0.12); border:2px solid ${accent}; border-radius:26px; padding:30px 34px;">
    <div style="font-size:24px; font-weight:800; color:${accent}; margin-bottom:10px;">
      🏢 ${escapeHtml(job.orgTa || 'அதிகாரப்பூர்வ அறிவிப்பு')}
    </div>
    <div style="font-size:42px; font-weight:900; color:#fef08a; line-height:1.25;">
      ${escapeHtml(job.roleTa)}
    </div>
  </div>

  <div style="display:flex; flex-direction:column; gap:16px; flex:1; justify-content:center;">
    <div class="row">
      <div class="lbl">🎓 கல்வித் தகுதி</div>
      <div class="val">${escapeHtml(job.qualificationTa)}</div>
    </div>
    <div class="row">
      <div class="lbl">💰 ஊதியம் / சம்பளம்</div>
      <div class="val" style="color:#4ade80;">${escapeHtml(job.salaryTa)}</div>
    </div>
    <div class="row">
      <div class="lbl">👥 பணியிடங்கள்</div>
      <div class="val">${escapeHtml(job.vacanciesTa || 'அதிகாரப்பூர்வ அறிவிப்புப்படி')}</div>
    </div>
    <div class="row" style="border-color:#f59e0b;">
      <div class="lbl" style="color:#fde68a;">⏳ கடைசி தேதி</div>
      <div class="val" style="color:#fde047;">${escapeHtml(job.lastDateTa)}</div>
    </div>
  </div>

  <div style="text-align:center; font-size:23px; font-weight:800; color:#cbd5e1;">
    🔗 விண்ணப்பிக்கும் லிங்க் செய்தியுடன் இணைக்கப்பட்டுள்ளது • நண்பர்களுக்கு பகிரவும் ↗️
  </div>

  ${buildFooterHtml()}
</body>
</html>`;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  renderHtmlToImage(html, outputPath, { width: 1080, height: 1080 });
  return outputPath;
}
