
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
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
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error("Notification Delete Database Error:", error.message)
      return NextResponse.json({ error: "Unable to delete notification from server." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("Notification Delete Execution Crash:", e.message)
    return NextResponse.json({ error: "Internal server error occurred." }, { status: 500 })
  }
}
