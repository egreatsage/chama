// File Path: src/app/api/chamas/[id]/distribute/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import ChamaCycle from "@/models/ChamaCycle";

export async function POST(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = params;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const chama = await Chama.findById(chamaId);
    if (!chama) {
      return NextResponse.json({ error: "Chama not found." }, { status: 404 });
    }

    // Authorization: Only chairperson can trigger distribution
    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership || membership.role !== 'chairperson') {
      return NextResponse.json({ error: "Only the chairperson can distribute funds." }, { status: 403 });
    }
    
    // Logic Check: Ensure the goal has been met
    const targetAmount = chama.equalSharing.targetAmount || 0;
    if (chama.currentBalance < targetAmount) {
        return NextResponse.json({ error: "Savings goal has not been reached yet." }, { status: 400 });
    }

    const members = await ChamaMember.find({ chamaId, status: 'active' });
    if (members.length === 0) {
      return NextResponse.json({ error: "No active members to distribute funds to." }, { status: 400 });
    }
    
    // Calculate share per member
    const shareAmount = chama.currentBalance / members.length;

    // Create payout records for the historical cycle
    const payouts = members.map(member => ({
      userId: member.userId,
      amount: shareAmount
    }));

    // Create a historical record for this cycle
    await ChamaCycle.create({
      chamaId,
      cycleType: 'equal_sharing',
      targetAmount,
      totalCollected: chama.currentBalance,
      payouts,
      startDate: chama.createdAt, // Note: This could be improved to track specific cycle start dates in the future
      distributedBy: user.id,
    });

    // Atomically update the Chama: Reset the balance and add to total contributions
    await Chama.findByIdAndUpdate(chamaId, {
      $inc: { totalContributions: chama.currentBalance }, // Add the distributed amount to the lifetime total
      $set: { currentBalance: 0 } // Reset the current balance for the next cycle
    });
    
    // TODO: In a future step, you could send an email notification to all members about the successful payout.

    return NextResponse.json({ message: "Funds distributed and cycle recorded successfully." });

  } catch (error)    {
    console.error("Failed to distribute funds:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
