// app/api/user/profile/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/dbConnect';


export async function PUT(request) {
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
    
    const { firstName, lastName,email, phoneNumber, photoUrl } = await request.json();

    // Validation
    if (!firstName || !lastName || !phoneNumber || !email) {
      return NextResponse.json(
        { message: 'First name, last name, and phone number are required' },
        { status: 400 }
      );
    }

    // Check if phone number is already taken by another user
    const existingUser = await User.findOne({
      phoneNumber,
      email,
      _id: { $ne: decoded.userId }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Phone number is already in use by another user' },
        { status: 409 }
      );
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        firstName,
        lastName,
        phoneNumber,
        email,
        photoUrl: photoUrl || '',
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
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
    console.error('Profile update error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}