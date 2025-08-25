// src/app/api/dashboard-stats/route.js

import { NextResponse } from 'next/server';
import mongoose from 'mongoose'; // 1. Import mongoose
import { connectDB } from "@/lib/dbConnect";
import Contribution from "@/models/Contribution";
import Withdrawal from "@/models/Withdrawal";
import { getServerSideUser } from '@/lib/auth';

export async function GET() {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Convert the user ID string to a MongoDB ObjectId
    const userId = new mongoose.Types.ObjectId(user.id);

    // Calculate total contributions for the user
    const contributionStats = await Contribution.aggregate([
      { $match: { userId: userId, status: 'confirmed' } }, // 3. Use the ObjectId in the query
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Calculate total approved withdrawals for the user
    const withdrawalStats = await Withdrawal.aggregate([
      { $match: { userId: userId, status: 'approved' } }, // 4. Use the ObjectId in the query
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalContributions = contributionStats.length > 0 ? contributionStats[0].total : 0;
    const totalWithdrawals = withdrawalStats.length > 0 ? withdrawalStats[0].total : 0;
    const netBalance = totalContributions - totalWithdrawals;

    // Optional: for debugging in your terminal
    console.log("User Dashboard Stats:", { totalContributions, totalWithdrawals, netBalance });

    return NextResponse.json({
      totalContributions,
      totalWithdrawals,
      netBalance,
    });

  } catch (error) {
    console.error("Failed to fetch user dashboard stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}