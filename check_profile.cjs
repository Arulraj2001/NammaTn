const fs = require('fs');

const envPath = './.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || '';

async function check() {
  console.log("Checking Supabase via HTTP REST API...");
  
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Fetch from profile table
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profile?select=*&limit=5`, { headers });
    const profileStatus = profileRes.status;
    const profileText = await profileRes.text();
    
    console.log(`Profile table HTTP Status: ${profileStatus}`);
    if (profileStatus >= 200 && profileStatus < 300) {
      console.log("✅ Profile table exists!");
      console.log("Profiles data:", JSON.parse(profileText));
    } else {
      console.log("❌ Profile table error:", profileText);
    }
  } catch (err) {
    console.error("HTTP Request failed:", err.message);
  }
}

check();
