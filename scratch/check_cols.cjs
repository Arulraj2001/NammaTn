// scratch/check_cols.cjs
const fs = require('fs');

// Read and parse env file
const envText = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.NEXT_PUBLIC_VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  try {
    const res = await fetch(`${url}/rest/v1/post?limit=1`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      console.log('Post columns:', Object.keys(data[0]));
    } else {
      console.log('Empty table or check failed', data);
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
