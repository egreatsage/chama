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
    // ADD THESE CALLBACKS
    async jwt({ token, user }) {
      // Runs on sign-in and subsequent requests
      if (user) {
        // On initial sign-in, try to get the DB ID immediately
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
      } else if (!token.id) {
        // If token exists but lacks ID (rare edge case), fetch it
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
};