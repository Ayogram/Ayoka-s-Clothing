const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
  }
});

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('orders')
    .select('items')
    .eq('transaction_id', 'AYK-3492')
    .single();

  if (error) {
    console.error(error);
  } else {
    console.log('---JSON_START---');
    console.log(JSON.stringify(data.items, null, 2));
    console.log('---JSON_END---');
  }
}

check();
