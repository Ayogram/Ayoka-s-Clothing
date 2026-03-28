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

async function testBareInsert() {
  const bareNotif = {
    type: 'contact',
    title: 'Bare Test',
    message: 'Testing minimal fields...',
    status: 'unread'
  };

  console.log('--- Testing with BARE payload ---');
  const { error } = await anonClient.from('notifications').insert([bareNotif]);
  if (error) {
    console.log('BARE_FAIL:', error.message);
  } else {
    console.log('BARE_SUCCESS: Minimal insert worked.');
  }
}

testBareInsert();
