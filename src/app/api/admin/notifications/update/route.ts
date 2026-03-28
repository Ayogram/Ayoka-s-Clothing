import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    const { action, id, payload } = await req.json()

    if (action === "markRead") {
      if (!id) return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
      
      const { error } = await supabaseAdmin.from('notifications').update({ status: 'read' }).eq('id', id)
      if (error) throw error

      return NextResponse.json({ success: true })
    }

    if (action === "sendReply") {
      const { message, customer_id } = payload
      
      const { error } = await supabaseAdmin.from('notifications').insert([
        {
          type: 'reply',
          title: `Reply from Ayoka Concierge`,
          message: message,
          customer_id: customer_id,
          sender_name: 'Ayoka Concierge',
          sender_email: 'concierge@Ayoka.com',
          status: 'unread'
        }
      ])
      
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (err: any) {
    console.error("Admin Notifications Update API Error:", err)
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 })
  }
}
