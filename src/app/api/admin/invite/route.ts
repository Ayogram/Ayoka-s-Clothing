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
      
      // Also notify existing user that they've been upgraded
      try {
        const loginUrl = new URL('/login', req.url).toString();
        const htmlContent = `
          <div style="font-family: sans-serif; text-align: center; padding: 40px 20px; background-color: #fafafa; border: 1px solid #eee;">
            <h1 style="font-size: 24px; font-style: italic; color: #000; margin-bottom: 10px;">Ayoka Concierge</h1>
            <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.2em; color: #888; margin-bottom: 30px;">Access Upgraded</h2>
            <p style="color: #333; line-height: 1.6;">Your existing Ayoka's Clothing account has been granted administrative permissions.</p>
            <p style="color: #333; line-height: 1.6;">You can log in with your current password or via Google.</p>
            <div style="margin: 40px 0;">
              <a href="${loginUrl}" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 0.3em;">Access Portal</a>
            </div>
            <p style="font-size: 10px; color: #888; margin-top: 40px;">Please do not reply to this email.</p>
          </div>
        `;

        await fetch(new URL('/api/send-email', req.url).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: "Account Upgraded to Admin - Ayoka Concierge",
            html: htmlContent
          })
        });
      } catch (emailErr) {
        console.error("Failed to send upgrade email", emailErr);
      }

      return NextResponse.json({ success: true, message: "Role upgraded to admin." })
    }

    // Create new admin profile placeholder by creating auth.users identity first
    const tempPassword = randomUUID().slice(0, 12)
    const { data: authData } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      password: tempPassword
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

    // Send the invite email
    try {
      const loginUrl = new URL('/login', req.url).toString();
      const htmlContent = `
        <div style="font-family: sans-serif; text-align: center; padding: 40px 20px; background-color: #fafafa; border: 1px solid #eee;">
          <h1 style="font-size: 24px; font-style: italic; color: #000; margin-bottom: 10px;">Ayoka Concierge</h1>
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.2em; color: #888; margin-bottom: 30px;">Admin Access Granted</h2>
          <p style="color: #333; line-height: 1.6;">You have been granted administrative access to the Ayoka's Clothing portal.</p>
          <p style="color: #333; line-height: 1.6;">Your registered email is: <strong>${email}</strong></p>
          <p style="color: #333; line-height: 1.6;">Your temporary password is: <strong style="color: #000; background: #eee; padding: 4px 8px; border-radius: 4px;">${tempPassword}</strong></p>
          <div style="margin: 40px 0;">
            <a href="${loginUrl}" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 0.3em;">Log In Now</a>
          </div>
          <p style="font-size: 10px; color: #888; margin-top: 40px;">Please do not reply to this email.</p>
        </div>
      `;

      await fetch(new URL('/api/send-email', req.url).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Admin Access Granted - Ayoka Concierge",
          html: htmlContent
        })
      });
    } catch (emailErr) {
      console.error("Failed to send invite email", emailErr);
      // We don't fail the request since the admin was created successfully
    }

    return NextResponse.json({ success: true, message: `Access granted to ${email}` })

  } catch (err: any) {
    console.error("Admin Invite API Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
