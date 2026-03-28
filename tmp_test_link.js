const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  const email = "test_verify_" + Date.now() + "@example.com";
  console.log("Testing with", email);
  
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email: email,
    password: "password123",
    data: { full_name: "Test User" }
  });
  
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
