// src/app/api/admin/withdrawals/route.js

import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Withdrawal from "@/models/Withdrawal";
import User from '@/models/User'; // Make sure User model is imported for the ref to work
import { getServerSideUser } from '@/lib/auth';

// A helper to check for admin/treasurer roles
const hasElevatedPrivileges = (user) => {
  return user && ['admin', 'treasurer'].includes(user.role);
};

export async function GET() {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user || !hasElevatedPrivileges(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Correctly populate the 'userId' path from the Withdrawal schema
    const withdrawals = await Withdrawal.find({})
      .populate({
          path: 'userId', // <-- THIS IS THE CORRECT PATH NAME
          select: 'firstName lastName', // Fields to include from the User model
          model: User 
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ withdrawals });

  } catch (error) {
    console.error("Failed to fetch all withdrawals:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}