import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import ChamaCycle from "@/models/ChamaCycle";
import Transaction from "@/models/Transaction";

export async function POST(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = await params;

    // 1. Authorization: Check if user is the chairperson
    const membership = await ChamaMember.findOne({ userId: user.id, chamaId: chamaId });
    if (!membership || membership.role !== 'chairperson') {
      return NextResponse.json({ error: "Only the chairperson can distribute funds." }, { status: 403 });
    }

    const chama = await Chama.findById(chamaId);
    if (!chama || chama.operationType !== 'equal_sharing') {
      return NextResponse.json({ error: "This is not an equal sharing chama." }, { status: 400 });
    }

    // 2. Validation: Check if the goal is met (for simplicity, we assume the admin confirms this)
    if (chama.currentBalance <= 0) {
        return NextResponse.json({ error: "There are no funds to distribute." }, { status: 400 });
    }

    // 3. Calculate Shares
    const activeMembers = await ChamaMember.find({ chamaId: chamaId, status: 'active' });
    if (activeMembers.length === 0) {
        return NextResponse.json({ error: "No active members to distribute funds to." }, { status: 400 });
    }

    const totalBalance = chama.currentBalance;
    const sharePerMember = totalBalance / activeMembers.length;

    // 4. Create Records
    const payoutEntries = activeMembers.map(member => ({
        userId: member.userId,
        amountReceived: sharePerMember
    }));

    // Find the latest cycle number to increment it
    const lastCycle = await ChamaCycle.findOne({ chamaId }).sort({ cycleNumber: -1 });
    const newCycleNumber = (lastCycle?.cycleNumber || 0) + 1;

    const newCycle = await ChamaCycle.create({
        chamaId,
        type: 'equal_sharing',
        cycleNumber: newCycleNumber,
        startDate: chama.createdAt, // Or a more specific cycle start date if you add it
        totalAmountDistributed: totalBalance,
        payouts: payoutEntries
    });

    // Create a transaction record for each member for their personal history
    const transactionPromises = activeMembers.map(member => {
        return Transaction.create({
            chamaId,
            userId: member.userId,
            type: 'payout',
            amount: sharePerMember,
            description: `Equal sharing payout for Cycle #${newCycleNumber}`,
            referenceId: newCycle._id, // Link to the cycle event
        });
    });
    await Promise.all(transactionPromises);

    // 5. Update Chama State
    chama.currentBalance = 0;
    // Optional: Reset savings target or end date for the next cycle
    // chama.equalSharing.savingEndDate = ... 
    await chama.save();

    // 6. TODO: Send Email Notifications to all members

    return NextResponse.json({ message: `Successfully distributed ${totalBalance} among ${activeMembers.length} members.`, cycle: newCycle });

  } catch (error) {
    console.error("Failed to distribute funds:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
