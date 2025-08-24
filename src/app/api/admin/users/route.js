// src/app/api/admin/withdrawals/route.js

import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import User from '@/models/User'; 
import { getServerSideUser } from '@/lib/auth';


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
    const users = await User.find({})
    //   .populate({
    //       path: 'userId', // <-- THIS IS THE CORRECT PATH NAME
    //       select: 'firstName lastName', // Fields to include from the User model
    //       model: User 
    //   })
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });

  } catch (error) {
    console.error("Failed to fetch all users:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}