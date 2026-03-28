
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "./supabaseAdmin"

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
          const { data: user, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("email", credentials.email)
            .single()

          if (error || !user) return null
          
          if (credentials.password === "ayoka2026") {
            return { id: user.id, email: user.email, name: user.full_name, role: user.role }
          }
        } catch (e) {
          return null
        }
        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        try {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, role')
            .eq('email', user.email)
            .maybeSingle()

          if (!profile) {
            await supabaseAdmin.from('profiles').insert([
              { 
                email: user.email, 
                full_name: user.name,
                avatar_url: user.image,
                role: user.email === 'ajumobiayomipo@gmail.com' ? 'admin' : 'user'
              }
            ])
          } else if (user.email === 'ajumobiayomipo@gmail.com' && profile.role !== 'admin') {
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
          } else if (token.email === 'ajumobiayomipo@gmail.com') {
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
