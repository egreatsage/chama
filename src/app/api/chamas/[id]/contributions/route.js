// File Path: src/app/api/chamas/[id]/contributions/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import Contribution from "@/models/Contribution";
import User from '@/models/User';
import { sendManualContributionEmail } from '@/lib/email'; // Import the new email function
import { logAuditEvent } from '@/lib/auditLog';

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
    const adminUser = await getServerSideUser(); // The admin performing the action
    const { id: chamaId } = params;
    const { memberId, amount, notes } = await request.json();

    if (!memberId || !amount) {
      return NextResponse.json({ error: "Member and amount are required." }, { status: 400 });
    }

    const adminMembership = await ChamaMember.findOne({ userId: adminUser.id, chamaId });
    if (!adminMembership || !['chairperson', 'treasurer'].includes(adminMembership.role)) {
      return NextResponse.json({ error: "You do not have permission to add contributions." }, { status: 403 });
    }
    
    const newContribution = await Contribution.create({
      chamaId,
      userId: memberId,
      amount: Number(amount),
      paymentMethod: 'cash',
      status: 'confirmed',
      notes: notes || `Recorded by ${adminUser.firstName}`
    });

    await Chama.findByIdAndUpdate(chamaId, {
      $inc: { currentBalance: newContribution.amount }
    });

        const member = await User.findById(memberId);
    await logAuditEvent({
        chamaId,
        adminId: adminUser.id,
        userId: memberId,
        action: 'MANUAL_CONTRIBUTION',
        category: 'CONTRIBUTION',
        amount: newContribution.amount,
        description: `Recorded a manual cash contribution for ${member?.firstName || 'user'}. Notes: ${notes || ''}`,
        after: newContribution.toObject()
    });

    // --- NEW: Send Email Notification ---
    try {
        const member = await User.findById(memberId);
        const chama = await Chama.findById(chamaId);
        if (member && chama) {
            await sendManualContributionEmail({
                to: member.email,
                memberName: member.firstName,
                chamaName: chama.name,
                amount: newContribution.amount,
                adminName: adminUser.firstName
            });
        }
    } catch (emailError) {
        console.error("Contribution saved, but failed to send email:", emailError);
    }
    // --- END ---

    return NextResponse.json({ 
      message: 'Contribution recorded successfully.', 
      contribution: newContribution 
    }, { status: 201 });

  } catch (error) {
    console.error("Failed to record contribution:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

