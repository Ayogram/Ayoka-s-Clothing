const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually because we can't use dotenv in a script easily sometimes
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

async function checkColumns() {
  try {
    const { data, error } = await supabase.from('media').select('*').limit(1);
    if (error) throw error;
    console.log('MEDIA_COLUMNS:', JSON.stringify(Object.keys(data[0] || {})));
    
    const { data: nData, error: nError } = await supabase.from('notifications').select('*').limit(1);
    if (nError) throw nError;
    console.log('NOTIF_COLUMNS:', JSON.stringify(Object.keys(nData[0] || {})));
  } catch (err) {
    console.error('ERROR_CHECK:', err.message);
  }
}

checkColumns();
