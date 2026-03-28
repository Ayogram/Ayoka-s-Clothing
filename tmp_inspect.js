
const { createClient } = require('@supabase/supabase-js');
const URL = 'https://yvhknbgqtlsxmrhbfohs.supabase.co';
const KEY = 'sb_publishable_h0JZJnLDtM8nhGWwXfmyyA_rp8k_t8N';
const supabase = createClient(URL, KEY);

async function inspect() {
  console.log('--- TABLES INSPECTION ---');
  
  // Try to get one row to see columns
  const { data: order } = await supabase.from('orders').select('*').limit(1);
  console.log('Order Columns:', order ? Object.keys(order[0]) : 'No orders found');

  const { data: notif } = await supabase.from('notifications').select('*').limit(1);
  console.log('Notification Columns:', notif ? Object.keys(notif[0]) : 'No notifications found');

  const { data: profiles } = await supabase.from('profiles').select('email, full_name, id, role');
  console.log('Profiles:', profiles);
}

inspect();
