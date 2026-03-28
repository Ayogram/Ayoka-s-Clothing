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

    const body = await req.json()
    const { action, orderId, payload } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    if (action === "updateStatus") {
      const { status, driver_name, driver_number } = payload
      const updateData: any = { status }
      if (status === 'shipped') {
        if (driver_name) updateData.driver_name = driver_name
        if (driver_number) updateData.driver_number = driver_number
      }

      const { error } = await supabaseAdmin.from('orders').update(updateData).eq('id', orderId)
      if (error) throw error

      return NextResponse.json({ success: true })
    }

    if (action === "toggleDelete") {
      const { is_deleted } = payload
      const { error } = await supabaseAdmin.from('orders').update({ is_deleted }).eq('id', orderId)
      if (error) throw error

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err: any) {
    console.error("Admin Orders API Error:", err)
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 })
  }
}
