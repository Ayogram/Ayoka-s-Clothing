
const { createClient } = require('@supabase/supabase-js');
const URL = 'https://yvhknbgqtlsxmrhbfohs.supabase.co';
const KEY = 'sb_publishable_h0JZJnLDtM8nhGWwXfmyyA_rp8k_t8N';
const supabase = createClient(URL, KEY);

async function findOrder() {
  console.log('--- FINDING ORDERS FOR: ayomipo ajumobi ---');
  
  // 1. Search Orders by contact_number substrings, shipping address, or items
  const { data: allOrders, error } = await supabase.from('orders').select('*');
  if (error) {
      console.error('Fetch Error:', error);
      return;
  }

  console.log(`Total orders in DB: ${allOrders.length}`);
  allOrders.forEach(o => {
      console.log(` - Order ID: ${o.id}, CustomerID: ${o.customer_id}, Phone: ${o.contact_number}, Total: ${o.total_amount}`);
  });

  // 2. Search Profiles
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log('Current Profiles in DB:', profiles);
}

findOrder();
