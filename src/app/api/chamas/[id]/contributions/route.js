// File Path: src/app/api/chamas/[id]/contributions/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import Contribution from "@/models/Contribution";
import User from '@/models/User';

// GET: Fetch all contributions for a specific Chama
export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = await params;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Authorization: Ensure the user is a member of the chama
    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
    }

    const contributions = await Contribution.find({ chamaId: chamaId, status: 'confirmed' })
      .populate({
        path: 'userId',
        select: 'firstName lastName photoUrl',
        model: User
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ contributions });

  } catch (error) {
    console.error("Failed to fetch contributions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add a manual (e.g., cash) contribution
export async function POST(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = params;
    const { memberId, amount, notes } = await request.json();

    if (!memberId || !amount) {
      return NextResponse.json({ error: "Member and amount are required." }, { status: 400 });
    }

    // Authorization: Only chairperson or treasurer can add manual contributions
    const adminMembership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!adminMembership || !['chairperson', 'treasurer'].includes(adminMembership.role)) {
      return NextResponse.json({ error: "You do not have permission to add contributions." }, { status: 403 });
    }
    
    // 1. Create the contribution record
    const newContribution = await Contribution.create({
      chamaId,
      userId: memberId,
      amount: Number(amount),
      paymentMethod: 'cash',
      status: 'confirmed', // Manual entries are confirmed by default
      notes: notes || 'Cash contribution recorded by chairperson.'
    });

    // 2. Atomically update the Chama's current balance
    await Chama.findByIdAndUpdate(chamaId, {
      $inc: { currentBalance: newContribution.amount }
    });

    // TODO: Send an email notification to the member about the recorded contribution

    return NextResponse.json({ 
      message: 'Contribution recorded successfully.', 
      contribution: newContribution 
    }, { status: 201 });

  } catch (error) {
    console.error("Failed to record contribution:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

