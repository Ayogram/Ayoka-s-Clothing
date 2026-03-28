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

// Try inserting with ANON key (this should fail if RLS is on)
const anonClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Try inserting with SERVICE key (this should work regardless of RLS)
const serviceClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
  const dummyNotif = {
    type: 'contact',
    title: 'System Test',
    message: 'Testing database connection...',
    sender_name: 'System Bot',
    sender_email: 'bot@Ayoka.com',
    status: 'unread'
  };

  console.log('--- Testing with ANON key ---');
  const { error: anonError } = await anonClient.from('notifications').insert([dummyNotif]);
  if (anonError) {
    console.log('ANON_FAIL:', anonError.message);
    if (anonError.code === '42P01') console.log('TABLE_NOT_FOUND: notifications');
  } else {
    console.log('ANON_SUCCESS: RLS might be open (insert allowed)');
  }

  console.log('\n--- Testing with SERVICE key ---');
  const { error: serviceError } = await serviceClient.from('notifications').insert([dummyNotif]);
  if (serviceError) {
    console.log('SERVICE_FAIL:', serviceError.message);
  } else {
    console.log('SERVICE_SUCCESS: Table exists and service role confirmed.');
  }
}

testInsert();
