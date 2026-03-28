import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
    }

    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile) {
      if (existingProfile.role === 'admin') {
         return NextResponse.json({ success: true, message: "User is already an admin." })
      }
      
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', existingProfile.id)
        
      if (updateError) throw updateError
      return NextResponse.json({ success: true, message: "Role upgraded to admin." })
    }

    // Create new admin profile placeholder by creating auth.users identity first
    const { data: authData } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      password: randomUUID()
    })

    const finalId = authData?.user?.id || randomUUID()

    const { error: insertError } = await supabaseAdmin.from('profiles').insert([
      {
        id: finalId,
        email: email,
        full_name: "Invited Admin",
        role: "admin"
      }
    ])

    if (insertError) {
      console.error("Insert Error:", insertError)
      return NextResponse.json({ error: "Failed to invite admin", details: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Access granted to ${email}` })

  } catch (err: any) {
    console.error("Admin Invite API Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
