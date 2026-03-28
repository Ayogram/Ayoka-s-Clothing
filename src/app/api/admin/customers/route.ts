
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  const session = await getServerSession(authOptions) as any
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ 
      error: "Server Configuration Error: Admin Privileges Not Configured. Please add your SUPABASE_SERVICE_ROLE_KEY to .env.local" 
    }, { status: 500 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')

    if (error) {
      console.error("Customers Fetch Database Error:", error.message)
      return NextResponse.json({ error: "Failed to fetch customer data from database." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error("Customers API Execution Crash:", e.message)
    return NextResponse.json({ error: "Internal server error occurred while processing request." }, { status: 500 })
  }
}
