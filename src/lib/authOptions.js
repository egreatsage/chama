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
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        await connectDB();
        
        try {
          // Check if user exists
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Generate a random password since Schema requires it
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            // Handle names (Google gives given_name/family_name)
            const firstName = profile.given_name || user.name.split(' ')[0] || 'User';
            const lastName = profile.family_name || user.name.split(' ').slice(1).join(' ') || 'Name';

            // Create new user
            await User.create({
              email: user.email,
              firstName: firstName,
              lastName: lastName,
              photoUrl: user.image,
              role: 'user',
              phoneNumber: `google-${Date.now()}`, // Placeholder as phone is required unique
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
  },
  pages: {
    signIn: '/login',
    error: '/login',
  }
};