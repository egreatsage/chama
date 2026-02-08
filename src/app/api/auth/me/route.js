// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/dbConnect';
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/authOptions";

export async function GET(request) {
  try {
    await connectDB();
    
    let user = null;
    let userId = null;

    // 1. STRATEGY A: Check for Custom Auth Token (Email/Password login)
    const token = request.cookies.get('auth-token')?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (error) {
        // Token invalid, we will try NextAuth next
        console.log("Custom token invalid, checking NextAuth session");
      }
    }

    // 2. STRATEGY B: Check NextAuth Session (Google login)
    // If we haven't found a user via custom token yet
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        // Find the user by email since NextAuth default session provides email
        const foundUser = await User.findOne({ email: session.user.email }).select('_id');
        if (foundUser) {
          userId = foundUser._id;
        }
      }
    }

    // 3. Final User Fetch
    if (userId) {
      user = await User.findById(userId).select('-password');
    }

    if (!user) {
      return NextResponse.json(
        { message: 'User not found or unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        photoUrl: user.photoUrl,
      }
    });
   
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}