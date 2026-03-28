const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=').map(s => s.trim()))
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  try {
    // Try to find a row in notifications to see columns
    const { data, error } = await supabase.from('notifications').select('*').limit(1);
    console.log('NOTIF_DATA:', JSON.stringify(data));
    if (data && data.length > 0) {
      console.log('NOTIF_KEYS:', Object.keys(data[0]));
    } else {
      console.log('NOTIF_EMPTY: Looking for schema via error or empty select...');
      // If empty, let's try to insert a dummy row to see what happens
    }
    
    // Check media table again
    const { data: mData } = await supabase.from('media').select('*').limit(1);
    console.log('MEDIA_KEYS:', Object.keys(mData?.[0] || {}));
  } catch (err) {
    console.error('FAIL:', err.message);
  }
}

check();
