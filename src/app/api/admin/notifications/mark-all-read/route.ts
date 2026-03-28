
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST() {
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
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ status: 'read' })
      .eq('status', 'unread')

    if (error) {
      console.error("Mark Read Database Error:", error.message)
      return NextResponse.json({ error: "Unable to update statuses on server." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("Mark Read Execution Crash:", e.message)
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 })
  }
}
