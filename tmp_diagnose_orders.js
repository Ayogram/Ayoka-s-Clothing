
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
  const { data: orders } = await supabase.from('orders').select('*').limit(5);
  const { data: profiles } = await supabase.from('profiles').select('*').limit(5);

  console.log('--- SAMPLE ORDER ---');
  console.log(JSON.stringify(orders[0], null, 2));
  
  console.log('--- SAMPLE PROFILE ---');
  console.log(JSON.stringify(profiles[0], null, 2));
  
  if (orders[0]?.customer_id) {
     const { data: match } = await supabase.from('profiles').select('*').eq('id', orders[0].customer_id).single();
     console.log('--- MATCHING PROFILE BY ID ---');
     console.log(JSON.stringify(match, null, 2));
  }
}

diagnose();
