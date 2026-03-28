
const { createClient } = require('@supabase/supabase-js');

// Hand-copied from .env.local
const URL = 'https://yvhknbgqtlsxmrhbfohs.supabase.co';
const KEY = 'sb_publishable_h0JZJnLDtM8nhGWwXfmyyA_rp8k_t8N';

const supabase = createClient(URL, KEY);

async function diagnose() {
  const email = 'ajumobiayomipo@gmail.com';
  console.log(`Diagnosing for: ${email}`);

  // 1. Find Profile
  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('email', email).single();
  console.log('Profile:', profile || profileError);

  if (!profile) {
    console.log('No profile found. Searching for similar emails...');
    const { data: similar } = await supabase.from('profiles').select('email').ilike('email', `%${email.split('@')[0]}%`);
    console.log('Similar profiles:', similar);
    // Continue anyway to see if orders exist for this email
  }

  const userId = profile?.id;

  // 2. Find Orders
  let orderQuery = supabase.from('orders').select('*');
  if (userId) {
      orderQuery = orderQuery.or(`customer_id.eq.${userId},customer_email.eq.${email}`);
  } else {
      orderQuery = orderQuery.eq('customer_email', email);
  }
  
  const { data: orders, error: orderError } = await orderQuery;
  console.log(`Orders found: ${orders?.length || 0}`, orderError || '');
  if (orders && orders.length > 0) {
      orders.forEach(o => console.log(` - Order ${o.transaction_id || o.id}: CustomerID=${o.customer_id}, Email=${o.customer_email}, Total=${o.total_amount}, Status=${o.status}`));
  }

  // 3. Find Notifications
  let notifQuery = supabase.from('notifications').select('*');
  if (userId) {
      notifQuery = notifQuery.or(`customer_id.eq.${userId},sender_email.eq.${email}`);
  } else {
      notifQuery = notifQuery.eq('sender_email', email);
  }

  const { data: notifs, error: notifError } = await notifQuery;
  console.log(`Notifications found: ${notifs?.length || 0}`, notifError || '');
  if (notifs && notifs.length > 0) {
      notifs.forEach(n => console.log(` - Notif ${n.id}: Type=${n.type}, CustomerID=${n.customer_id}, Email=${n.sender_email}, Status=${n.status}`));
  }
}

diagnose();
