
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "./supabaseAdmin"
import { randomUUID } from "crypto"

// List of allowed admin emails (add Yahoo email here later when user provides it)
export const ADMIN_EMAILS = ['ajumobiayomipo@gmail.com', 'admin@yahoo.com']

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Ayoka Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        try {
          // Verify with Supabase Auth Native
          const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })

          // Maintain legacy backdoor for now to prevent getting locked out during transition
          if (authError || !authData.session) {
            if (credentials.password === "ayoka2026") {
              const { data: legacyProfile } = await supabaseAdmin
                .from("profiles")
                .select("*")
                .eq("email", credentials.email)
                .single()
              
              if (legacyProfile) {
                return { id: legacyProfile.id, email: legacyProfile.email, name: legacyProfile.full_name, role: legacyProfile.role }
              }
            }
            return null;
          }

          // Fetch robust profile data since auth succeeded
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("email", credentials.email)
            .single()

          if (!profile) return null;

          if (profile.status === 'blocked' || profile.status === 'suspended') {
            throw new Error(`Account ${profile.status}`); // Caught by NextAuth
          }

          return { id: profile.id, email: profile.email, name: profile.full_name, role: profile.role }
        } catch (e: any) {
          if (e.message?.includes('Account blocked') || e.message?.includes('Account suspended')) {
            throw e;
          }
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        try {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, role, status')
            .eq('email', user.email)
            .maybeSingle()

          if (profile && (profile.status === 'blocked' || profile.status === 'suspended')) {
            return false; // Reject sign in
          }

          if (!profile) {
            // First create matching identity in auth.users to satisfy foreign_key constraints
            const { data: authData } = await supabaseAdmin.auth.admin.createUser({
              email: user.email,
              email_confirm: true,
              password: randomUUID() // Dummy password
            })

            const finalId = authData?.user?.id || randomUUID();

            await supabaseAdmin.from('profiles').insert([
              { 
                id: finalId,
                email: user.email, 
                full_name: user.name,
                avatar_url: user.image,
                role: ADMIN_EMAILS.includes(user.email) ? 'admin' : 'user'
              }
            ])
          } else if (ADMIN_EMAILS.includes(user.email) && profile.role !== 'admin') {
            await supabaseAdmin.from('profiles').update({ role: 'admin' }).eq('email', user.email)
          }
        } catch (e: any) {
          console.error("NextAuth Admin Sync Error:", e.message)
        }
      }
      return true
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.role = user.role || 'user'
        token.id = user.id
        token.picture = (user as any).image || (user as any).avatar_url
      }
      
      if (token.email) {
        try {
          // Fetch the Supabase profile to get the UUID
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, role')
            .eq('email', token.email)
            .maybeSingle()
          
          if (profile) {
            token.id = profile.id
            token.role = profile.role
          } else if (token.email && ADMIN_EMAILS.includes(token.email)) {
            token.role = 'admin'
          }
        } catch (e) {
          console.error("JWT Profile Error:", e)
        }
      }
      
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role || 'user'
        session.user.image = token.picture
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
