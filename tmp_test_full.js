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

const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testFullInsert() {
  const fullNotif = {
    type: 'contact',
    title: 'Full Test',
    message: 'Testing with customer_id...',
    sender_name: 'System Bot',
    sender_email: 'bot@Ayoka.com',
    customer_id: null, // Test with null
    status: 'unread'
  };

  console.log('--- Testing with FULL payload (null customer_id) ---');
  const { error } = await anonClient.from('notifications').insert([fullNotif]);
  if (error) {
    console.log('FULL_FAIL:', error.message);
    // If it fails here, maybe customer_id is the issue or the table doesn't have it.
  } else {
    console.log('FULL_SUCCESS: customer_id = null is allowed');
  }
}

testFullInsert();
