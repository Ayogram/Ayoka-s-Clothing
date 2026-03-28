import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ADMIN_EMAILS } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // 1. Create User & Generate Verification Link in Supabase Auth Native
    // This securely hashes the password and returns an action_link we can email to the user
    const { data: linkData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      data: {
        full_name: fullName,
      },
    });

    if (authError || !linkData?.user || !linkData?.properties?.action_link) {
      // Fallback to error message if link generation fails (e.g. user already exists)
      return NextResponse.json(
        { error: authError?.message || "Failed to create user or generate link. Email might already be in use." },
        { status: 400 }
      );
    }
    
    // We get the actual created user object back
    const authUser = linkData.user;

    // 2. Determine User Role
    const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";

    // 3. Create Corresponding Identity in 'profiles' Table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: authUser.id,
          email: email.toLowerCase(),
          full_name: fullName,
          role: role,
        },
      ]);

    if (profileError) {
      // If profile fails, clean up the auth user to prevent orphaned data
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      console.error("Profile Creation Error:", profileError);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // 4. Send the personalized verification email via Nodemailer
    try {
      const verificationUrl = linkData.properties.action_link;
      const htmlContent = `
        <div style="font-family: sans-serif; text-align: center; padding: 40px 20px; background-color: #fafafa; border: 1px solid #eee;">
          <h1 style="font-size: 24px; font-style: italic; color: #000; margin-bottom: 10px;">Ayoka Concierge</h1>
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.2em; color: #888; margin-bottom: 30px;">Verify Your Account</h2>
          <p style="color: #333; line-height: 1.6;">Welcome to Ayoka's Clothing, ${fullName}!</p>
          <p style="color: #333; line-height: 1.6;">Please verify your email address to activate your account and gain full access to the luxury portal.</p>
          <div style="margin: 40px 0;">
            <a href="${verificationUrl}" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 0.3em;">Verify Email</a>
          </div>
          <p style="font-size: 10px; color: #888; margin-top: 40px;">If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${verificationUrl}" style="color: #C5A059;">${verificationUrl}</a></p>
          <p style="font-size: 10px; color: #ccc; margin-top: 20px;">Please do not reply to this email.</p>
        </div>
      `;

      // Use absolute URL correctly by passing req.url
      await fetch(new URL('/api/send-email', request.url).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject: "Verify your email - Ayoka Concierge",
          html: htmlContent
        })
      });
    } catch (emailErr) {
      console.error("Failed to send verification email", emailErr);
      // We don't fail registration if email fails, but they might be stuck. They can request resend later if we build it.
    }

    return NextResponse.json(
      { message: "Registration successful. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration Exception:", error);
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
