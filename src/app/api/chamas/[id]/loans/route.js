// File Path: src/app/api/chamas/[id]/loans/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Loan from "@/models/Loan";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import User from '@/models/User';
import { logAuditEvent } from '@/lib/auditLog';
// Import the email function
import { sendGuarantorRequestEmail } from '@/lib/email';

// GET: Fetch loans for a Chama
export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = await params;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
    }

    // UPDATED: Populate guarantors details
    const loans = await Loan.find({ chamaId })
        .populate({ path: 'userId', select: 'firstName lastName photoUrl', model: User })
        .populate({ path: 'guarantors.userId', select: 'firstName lastName', model: User })
        .sort({ createdAt: 'desc' });
    
    return NextResponse.json({ loans });
  } catch (error) {
    console.error("Failed to fetch loans:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Request a new loan
export async function POST(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = await params;
    const { amount, reason, guarantors } = await request.json();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!amount || amount <= 0 || !reason) {
        return NextResponse.json({ error: "Valid amount and reason are required." }, { status: 400 });
    }

    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "You must be a member to request a loan." }, { status: 403 });
    }
    
    // Check if chama has enough balance
    const chama = await Chama.findById(chamaId);
    if (chama.currentBalance < amount) {
        return NextResponse.json({ error: "Insufficient funds in the chama to cover this loan." }, { status: 400 });
    }

    // Format guarantors array
    const formattedGuarantors = Array.isArray(guarantors) 
        ? guarantors.map(gId => ({ userId: gId, status: 'pending' }))
        : [];

    // Validating: Cannot guarantee yourself
    if (formattedGuarantors.some(g => g.userId === user.id)) {
        return NextResponse.json({ error: "You cannot be your own guarantor." }, { status: 400 });
    }

    // Fetch guarantor details (emails & names) for sending notifications
    const guarantorIds = formattedGuarantors.map(g => g.userId);
    const guarantorUsers = await User.find({ _id: { $in: guarantorIds } });

    // Create the loan
    const newLoan = await Loan.create({
      chamaId,
      userId: user.id,
      amount,
      reason,
      guarantors: formattedGuarantors
    });

    // Send email notifications to all guarantors
    const emailPromises = guarantorUsers.map(guarantor => {
        return sendGuarantorRequestEmail({
            to: guarantor.email,
            guarantorName: guarantor.firstName,
            requesterName: `${user.firstName} ${user.lastName}`,
            amount: amount,
            chamaName: chama.name,
            reason: reason
        }).catch(err => {
            // Log error but don't block the response
            console.error(`Failed to send email to ${guarantor.email}:`, err);
        });
    });

    // Send all emails in parallel
    await Promise.all(emailPromises);

    // Log audit event
    await logAuditEvent({
        chamaId,
        userId: user.id,
        action: 'LOAN_REQUEST',
        category: 'LOAN',
        amount: amount,
        description: `User requested a loan for: ${reason} with ${formattedGuarantors.length} guarantors`,
        after: newLoan.toObject()
    });

    return NextResponse.json({ loan: newLoan }, { status: 201 });
  } catch (error) {
    console.error("Failed to create loan request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}