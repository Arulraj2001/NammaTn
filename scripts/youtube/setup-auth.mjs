// scripts/youtube/setup-auth.mjs
// Interactive 1-click helper to obtain persistent YouTube OAuth2 Refresh Token

import http from 'http';
import readline from 'readline';

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;

const PORT = 3456;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube'
];

async function main() {
  console.log('====================================================');
  console.log('  VizhiTN YouTube OAuth2 Authorization Helper      ');
  console.log('====================================================\n');

  let clientId = CLIENT_ID;
  let clientSecret = CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (q) => new Promise(resolve => rl.question(q, resolve));

    clientId = (await question('Enter your YOUTUBE_CLIENT_ID: ')).trim();
    clientSecret = (await question('Enter your YOUTUBE_CLIENT_SECRET: ')).trim();
    rl.close();
  }

  if (!clientId || !clientSecret) {
    console.error('Error: Both Client ID and Client Secret are required.');
    process.exit(1);
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    }).toString();

  const server = http.createServer(async (req, res) => {
    try {
      const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
      if (reqUrl.pathname === '/callback') {
        const code = reqUrl.searchParams.get('code');
        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h1>Error: No authorization code received.</h1>');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>Authorization Successful!</h1><p>You can close this tab and return to your terminal.</p>');

        console.log('\nExchanging authorization code for persistent tokens...');
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
          })
        });

        const tokenData = await tokenRes.json();
        server.close();

        if (tokenData.refresh_token) {
          console.log('\n====================================================');
          console.log('SUCCESS! COPY THE FOLLOWING KEYS:');
          console.log('====================================================');
          console.log(`YOUTUBE_CLIENT_ID=${clientId}`);
          console.log(`YOUTUBE_CLIENT_SECRET=${clientSecret}`);
          console.log(`YOUTUBE_REFRESH_TOKEN=${tokenData.refresh_token}`);
          console.log('====================================================\n');
          console.log('Add these 3 keys to:');
          console.log('1. .env.local (for local runs)');
          console.log('2. GitHub Repository -> Settings -> Secrets and variables -> Actions\n');
          process.exit(0);
        } else {
          console.error('\nError: Google did not return a refresh_token.');
          console.error('Make sure you approved the prompt and used access_type=offline.');
          console.error(tokenData);
          process.exit(1);
        }
      }
    } catch (err) {
      console.error('Server error:', err);
    }
  });

  server.listen(PORT, () => {
    console.log('Step 1: Open the following URL in your browser:\n');
    console.log(authUrl);
    console.log('\nStep 2: Sign in with the Google Account that owns your YouTube Channel.');
    console.log('Step 3: Click "Allow" on the permissions screen.');
    console.log('\nWaiting for browser callback on ' + REDIRECT_URI + ' ...\n');
  });
}

main().catch(console.error);
