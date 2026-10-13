import { NextResponse } from 'next/server';

const WORKFLOW_MAP = {
  civic: 'autonomous-civic-bot.yml',
  tntoday: 'autonomous-tntoday-bot.yml',
  politics: 'autonomous-politics-bot.yml',
  digest: 'autonomous-daily-digest.yml',
  watchdog: 'autonomous-watchdog.yml',
  youtube: 'autonomous-youtube-bot.yml'
};

const REPO_OWNER = 'Arulraj2001';
const REPO_NAME = 'NammaTn';

function isAuthorized(request) {
  const secret = process.env.AUTO_PUBLISH_SECRET;
  if (!secret) return true; // dev mode

  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  if (querySecret === secret) return true;

  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ') && authHeader.slice(7).trim() === secret) {
    return true;
  }

  return false;
}

export async function GET(request) {
  return handleTrigger(request);
}

export async function POST(request) {
  return handleTrigger(request);
}

async function handleTrigger(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid secret token' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const botKey = (searchParams.get('bot') || 'civic').toLowerCase();
  const workflowFile = WORKFLOW_MAP[botKey];

  if (!workflowFile) {
    return NextResponse.json({ 
      error: `Invalid bot identifier: "${botKey}". Allowed: ${Object.keys(WORKFLOW_MAP).join(', ')}` 
    }, { status: 400 });
  }

  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_PAT;

  if (!githubToken) {
    return NextResponse.json({
      status: 'notice',
      bot: botKey,
      workflow: workflowFile,
      message: 'Workflow identified, but GITHUB_TOKEN is not set in web environment. Configure GITHUB_TOKEN to trigger GitHub Actions runner instantaneously via API.'
    });
  }

  try {
    const dispatchUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${workflowFile}/dispatches`;
    const ghRes = await fetch(dispatchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'VizhiTN-CronTrigger/1.0'
      },
      body: JSON.stringify({ ref: 'main' })
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      return NextResponse.json({
        error: `GitHub API error: ${ghRes.status} ${errText}`
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      bot: botKey,
      workflow: workflowFile,
      dispatched_at: new Date().toISOString(),
      message: `Triggered ${workflowFile} on main branch. GitHub runner will start in ~5 seconds.`
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
