import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      totalPrice,
      cart,
      formData,
      trackingId,
      receiptUrl
    } = await req.json()

    // Resolve internal Supabase UUID if the current ID is numeric (Google ID)
    let customerUuid = (session.user as any).id
    const userEmail = session.user.email

    if (!customerUuid || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerUuid)) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle()
      
      if (profileError) {
        return NextResponse.json({ error: "Could not verify your account profile.", details: profileError.message }, { status: 500 })
      }
      
      if (profile) {
        customerUuid = profile.id
      } else {
        return NextResponse.json({ error: "Your account profile was not found. Please log out and sign back in." }, { status: 400 })
      }
    }

    // Create Order using Supabase Admin bypasses all RLS entirely securely
    const { data: newOrder, error } = await supabaseAdmin.from('orders').insert([{
      customer_id: customerUuid,
      customer_email: userEmail, 
      total_amount: totalPrice,
      status: 'payment_sent',
      items: cart,
      shipping_address: formData.deliveryMethod === 'delivery' ? formData.address : 'Store Pickup',
      delivery_method: formData.deliveryMethod,
      contact_number: formData.phone,
      transaction_id: trackingId,
      payment_receipt: receiptUrl
    }]).select('*').single()

    if (error) {
      console.error("Order insertion error:", error)
      return NextResponse.json({ error: "Failed to create order record", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: newOrder })

  } catch (err: any) {
    console.error("Checkout API Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
