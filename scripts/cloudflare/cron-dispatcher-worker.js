// scripts/cloudflare/cron-dispatcher-worker.js
/**
 * VizhiTN Exact-Time IST Cron Dispatcher (Cloudflare Worker)
 *
 * Fires every 15 minutes (`0,15,30,45 * * * *`) with zero GitHub Cron Queue delay and
 * triggers exact workflow_dispatch runs on Arulraj2001/NammaTn at each IST slot.
 *
 * Required Worker Secret:
 *   GH_DISPATCH_TOKEN (GitHub token with `workflow` scope)
 */

const REPO_OWNER = 'Arulraj2001';
const REPO_NAME = 'NammaTn';

async function triggerWorkflow(token, workflowFile, inputs = {}) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${workflowFile}/dispatches`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'VizhiTN-Cloudflare-Cron/1.0',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: 'main', inputs }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[DISPATCH FAIL] ${workflowFile} (${JSON.stringify(inputs)}) -> HTTP ${res.status}: ${errText}`);
    return { workflowFile, ok: false, status: res.status };
  }
  console.log(`[DISPATCH OK] ${workflowFile} -> ${JSON.stringify(inputs)}`);
  return { workflowFile, ok: true, status: res.status };
}

function getRoundedIstSlot(date = new Date()) {
  const ist = new Date(date.getTime() + 5.5 * 3600 * 1000);
  const totalMins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const rounded = (Math.round(totalMins / 15) * 15) % (24 * 60);
  const hh = String(Math.floor(rounded / 60)).padStart(2, '0');
  const mm = String(rounded % 60).padStart(2, '0');
  // Convert JS getUTCDay (0=Sun..6=Sat) -> 1=Mon..7=Sun
  const jsDow = ist.getUTCDay();
  const isoDow = jsDow === 0 ? 7 : jsDow;
  return { timeIst: `${hh}:${mm}`, isoDow };
}

function getJobsForSlot(timeIst, isoDow) {
  const jobs = [];

  if (timeIst === '06:15') {
    jobs.push({ wf: 'autonomous-mindset-bot.yml', inputs: { slot: 'morning' } });
  }
  if (timeIst === '07:00') {
    jobs.push({ wf: 'autonomous-youtube-bot.yml', inputs: { pipeline_type: 'civic-alert' } });
  }
  if (timeIst === '07:30') {
    jobs.push({ wf: 'autonomous-civic-bot.yml', inputs: { pulse: 'morning' } });
    jobs.push({ wf: 'autonomous-youtube-bot.yml', inputs: { pipeline_type: 'quiz-morning-q' } });
  }
  if (timeIst === '07:45') {
    jobs.push({ wf: 'autonomous-tntoday-bot.yml', inputs: { pulse: 'auto' } });
  }
  if (timeIst === '10:30') {
    jobs.push({ wf: 'autonomous-youtube-bot.yml', inputs: { pipeline_type: 'quiz-morning-a' } });
  }
  if (timeIst === '12:00') {
    jobs.push({ wf: 'autonomous-civic-bot.yml', inputs: { pulse: 'midday' } });
  }
  if (timeIst === '12:30') {
    const ytDays = [1, 3, 5, 7];
    jobs.push({
      wf: 'autonomous-growth-reels-bot.yml',
      inputs: { pillar: 'current-affairs', meta_only: ytDays.includes(isoDow) ? 'false' : 'true' },
    });
  }
  if (timeIst === '14:30') {
    jobs.push({ wf: 'autonomous-mindset-bot.yml', inputs: { slot: 'afternoon' } });
  }
  if (timeIst === '15:00') {
    jobs.push({ wf: 'autonomous-civic-bot.yml', inputs: { pulse: 'poll' } });
  }
  if (timeIst === '16:00') {
    const ytDays = [1, 3, 5];
    jobs.push({
      wf: 'autonomous-growth-reels-bot.yml',
      inputs: { pillar: 'live-job', meta_only: ytDays.includes(isoDow) ? 'false' : 'true' },
    });
  }
  if (timeIst === '16:45') {
    const ytDays = [2, 6];
    jobs.push({
      wf: 'autonomous-growth-reels-bot.yml',
      inputs: { pillar: 'maths-shortcut', meta_only: ytDays.includes(isoDow) ? 'false' : 'true' },
    });
  }
  if (timeIst === '17:15') {
    const ytDays = [4, 7];
    jobs.push({
      wf: 'autonomous-growth-reels-bot.yml',
      inputs: { pillar: 'tamil-shortcut', meta_only: ytDays.includes(isoDow) ? 'false' : 'true' },
    });
  }
  if (timeIst === '17:45' && [2, 4, 6].includes(isoDow)) {
    const ytDays = [2, 4];
    jobs.push({
      wf: 'autonomous-growth-reels-bot.yml',
      inputs: { pillar: 'scheme-guide', meta_only: ytDays.includes(isoDow) ? 'false' : 'true' },
    });
  }
  if (timeIst === '18:30') {
    jobs.push({ wf: 'autonomous-youtube-bot.yml', inputs: { pipeline_type: 'quiz-evening-q' } });
  }
  if (timeIst === '19:00') {
    jobs.push({ wf: 'autonomous-civic-bot.yml', inputs: { pulse: 'evening' } });
  }
  if (timeIst === '21:00') {
    jobs.push({ wf: 'autonomous-youtube-bot.yml', inputs: { pipeline_type: 'quiz-evening-a' } });
  }

  return jobs;
}

export default {
  async fetch() {
    return new Response(JSON.stringify({ ok: true, service: 'vizhitn-cron-dispatcher' }), {
      headers: { 'content-type': 'application/json' },
    });
  },

  async scheduled(event, env, ctx) {
    const token = env.GH_DISPATCH_TOKEN;
    if (!token) {
      console.error('[FATAL] GH_DISPATCH_TOKEN secret not configured.');
      return;
    }

    const { timeIst, isoDow } = getRoundedIstSlot(new Date(event.scheduledTime || Date.now()));
    const jobs = getJobsForSlot(timeIst, isoDow);
    console.log(`[CRON TICK] IST=${timeIst} DOW=${isoDow} MatchedJobs=${jobs.length}`);

    if (jobs.length === 0) return;

    await Promise.all(jobs.map(j => triggerWorkflow(token, j.wf, j.inputs)));
  },
};
