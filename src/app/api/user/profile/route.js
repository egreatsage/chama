// src/app/api/user/profile/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();
    
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, photoUrl, currentPassword, newPassword } = body;

    // Validate basic fields
    if (!firstName || !lastName || !phoneNumber || !email) {
      return NextResponse.json(
        { message: 'First name, last name, and phone number are required' },
        { status: 400 }
      );
    }

    // Check uniqueness for phone/email (excluding current user)
    const existingUser = await User.findOne({
      $or: [{ phoneNumber }, { email }],
      _id: { $ne: decoded.userId }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Phone number or email is already in use by another user' },
        { status: 409 }
      );
    }

    // Find the user to update
    const userToUpdate = await User.findById(decoded.userId);
    if (!userToUpdate) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Prepare update object
    const updateData = {
      firstName,
      lastName,
      phoneNumber,
      email,
      photoUrl: photoUrl || '',
    };

    // Handle Password Update if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: 'Current password is required to set a new password' },
          { status: 400 }
        );
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, userToUpdate.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Incorrect current password' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        photoUrl: updatedUser.photoUrl,
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}