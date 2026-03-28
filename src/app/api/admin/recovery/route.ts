import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { randomUUID } from "crypto"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "No active session found. Please log in first." }, { status: 401 })
    }

    const { email, name, image } = session.user

    if (!email) {
      return NextResponse.json({ error: "Session missing email." }, { status: 400 })
    }

    // Check if profile already exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .maybeSingle()

    if (profile) {
      return NextResponse.json({ 
        success: true, 
        message: "Profile already exists and is healthy.", 
        profile 
      })
    }

    // Ensure auth identity exists for foreign key constraint
    const { data: authData } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      password: randomUUID()
    })

    const finalId = authData?.user?.id || randomUUID()

    // Insert new profile
    const { data: newProfile, error } = await supabaseAdmin.from('profiles').insert([
      { 
        id: finalId,
        email: email, 
        full_name: name || "Recovered Admin",
        avatar_url: image || null,
        role: 'admin' // Force admin role for recovery route since it's an emergency heal for the owner
      }
    ]).select('*').single()

    if (error) {
      return NextResponse.json({ error: "Failed to create profile", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Admin profile successfully generated/recovered. You can now use the portal and checkout.",
      profile: newProfile 
    })

  } catch (err: any) {
    console.error("Recovery API Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
