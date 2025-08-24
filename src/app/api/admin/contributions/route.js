

import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import User from '@/models/User'; 
import { getServerSideUser } from '@/lib/auth';
import Contribution from '@/models/Contribution';


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

   
    const contributions = await Contribution.find({})
      .populate({
          path: 'userId', // <-- THIS IS THE CORRECT PATH NAME
          select: 'firstName lastName', // Fields to include from the User model
          model: User 
      })
      .sort({ createdAt: -1 });
    console.log("Fetched contributions:", contributions);
    return NextResponse.json({ contributions });

  } catch (error) {
    console.error("Failed to fetch all contributions:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}