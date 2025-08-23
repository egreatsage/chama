// app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/dbConnect';



export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await connectDB();
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
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
      { message: 'Invalid token' },
      { status: 401 }
    );
  }
}