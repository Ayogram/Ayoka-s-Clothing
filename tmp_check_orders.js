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

async function checkOrders() {
  try {
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (error) throw error;
    console.log('ORDER_COLUMNS:', JSON.stringify(Object.keys(data[0] || {})));
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

checkOrders();
