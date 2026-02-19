// src/app/api/admin/users/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import User from '@/models/User'; 
import ChamaMember from '@/models/ChamaMember';
import Chama from '@/models/Chama';
import { getServerSideUser } from '@/lib/auth';

const hasElevatedPrivileges = (user) => {
  return user && user.role === 'admin'; // Removed 'treasurer' to prevent Chama-level admins from seeing system-wide users
};

export async function GET() {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user || !hasElevatedPrivileges(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all users
    const users = await User.find({}).lean().sort({ createdAt: -1 });

    // Fetch the chamas for each user
    const usersWithChamas = await Promise.all(users.map(async (u) => {
        // Find active memberships for this user
        const memberships = await ChamaMember.find({ userId: u._id, status: 'active' })
            .populate({
                path: 'chamaId',
                select: 'name',
                model: Chama
            }).lean();
        
        // Extract just the names of the Chamas
        const chamaNames = memberships
            .map(m => m.chamaId?.name)
            .filter(Boolean);

        return {
            ...u,
            chamas: chamaNames // Add the array of chama names to the user object
        };
    }));

    return NextResponse.json({ users: usersWithChamas });

  } catch (error) {
    console.error("Failed to fetch all users:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}