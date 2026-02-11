// src/lib/authOptions.js
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // 1. SIGN IN: Ensure user exists in DB (Existing code, kept as is)
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        await connectDB();
        try {
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            const firstName = profile.given_name || user.name.split(' ')[0] || 'User';
            const lastName = profile.family_name || user.name.split(' ').slice(1).join(' ') || 'Name';

            await User.create({
              email: user.email,
              firstName: firstName,
              lastName: lastName,
              photoUrl: user.image,
              role: 'user',
              phoneNumber: `google-${Date.now()}`,
              password: hashedPassword,
              emailVerified: true
            });
          }
          return true;
        } catch (error) {
          console.error("Error checking/creating user:", error);
          return false;
        }
      }
      return true;
    },
    
    // 2. JWT: Add DB ID and Role to the token
    async jwt({ token, user }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }
      return token;
    },

    // 3. SESSION: Pass ID and Role to the client/session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
};