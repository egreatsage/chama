// File Path: src/app/api/chamas/[id]/loans/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Loan from "@/models/Loan";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import User from '@/models/User';

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

    let loans;
    // Chairpersons and treasurers can see all loans
    if (['chairperson', 'treasurer'].includes(membership.role)) {
      loans = await Loan.find({ chamaId })
        .populate({ path: 'userId', select: 'firstName lastName photoUrl', model: User })
        .sort({ createdAt: 'desc' });
    } else {
      // Regular members can only see their own loans
      loans = await Loan.find({ chamaId, userId: user.id })
        .populate({ path: 'userId', select: 'firstName lastName photoUrl', model: User })
        .sort({ createdAt: 'desc' });
    }

    return NextResponse.json({ loans });
  } catch (error) {
    console.error("Failed to fetch loans:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}// POST: Request a new loan
export async function POST(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = await params;
    const { amount, reason } = await request.json();

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

    const newLoan = await Loan.create({
      chamaId,
      userId: user.id,
      amount,
      reason,
    });

    return NextResponse.json({ loan: newLoan }, { status: 201 });
  } catch (error) {
    console.error("Failed to create loan request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
