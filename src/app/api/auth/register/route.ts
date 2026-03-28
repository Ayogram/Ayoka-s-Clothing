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

    // 1. Create User in Supabase Auth Native
    // This securely hashes the password behind the scenes in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm to allow immediate login
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create user" },
        { status: 400 }
      );
    }

    // 2. Determine User Role
    const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "user";

    // 3. Create Corresponding Identity in 'profiles' Table
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          email: email.toLowerCase(),
          full_name: fullName,
          role: role,
        },
      ]);

    if (profileError) {
      // If profile fails, clean up the auth user to prevent orphaned data
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error("Profile Creation Error:", profileError);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Registration successful", user: { email, role } },
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
