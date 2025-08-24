// src/app/api/users/[id]/route.js (or wherever this should be located)
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from "@/lib/dbConnect";
import Withdrawal from "@/models/Withdrawal";
import User from '@/models/User';
import { getServerSideUser } from '@/lib/auth';

const hasElevatedPrivileges = (user) => {
  return user && ['admin', 'treasurer'].includes(user.role);
};

// PUT: Handle both status updates and amount edits
export async function PUT(request, { params }) {
  await connectDB();
  
  try {
    const user = await getServerSideUser();
    if (!user || !hasElevatedPrivileges(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { firstName, lastName,phoneNumber, email, role, password } = await request.json();

    const updateData = {};
    
    if (firstName) {
      updateData.firstName = firstName;
    }
    if (lastName) {
      updateData.lastName = lastName;
    }
    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber;
    }
    if (email) {
      updateData.email = email;
    }
    if (role) {
      updateData.role = role;
    }
    if (password) {
      // Hash the password before storing
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from response for security
    const userResponse = { ...updatedUser.toObject() };
    delete userResponse.password;

    return NextResponse.json({ 
      message: 'User updated successfully.', 
      user: userResponse 
    });
    
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove a User
export async function DELETE(request, { params }) {
  await connectDB();
  
  try {
    const user = await getServerSideUser();
    if (!user || !hasElevatedPrivileges(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully." });
    
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}