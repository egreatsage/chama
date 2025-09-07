// File Path: src/app/api/chamas/[id]/loans/[loanId]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Loan from "@/models/Loan";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import User from "@/models/User";
import { sendLoanStatusEmail } from '@/lib/email';

// PUT: Update a loan (approve/reject/repay)
export async function PUT(request, { params }) {
  await connectDB();
  try {
    const adminUser = await getServerSideUser();
    const { id: chamaId, loanId } = await params;
    const { status, rejectionReason }= await request.json();

    if (!adminUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const membership = await ChamaMember.findOne({ userId: adminUser.id, chamaId });
    if (!membership || !['chairperson', 'treasurer'].includes(membership.role)) {
      return NextResponse.json({ error: "You do not have permission to manage loans." }, { status: 403 });
    }

    if (!['approved', 'rejected', 'repaid'].includes(status)) {
        return NextResponse.json({ error: "Invalid status update." }, { status: 400 });
    }
    
    const loan = await Loan.findById(loanId).populate({ path: 'userId', model: User, select: 'firstName email' });
    if (!loan || loan.chamaId.toString() !== chamaId) {
        return NextResponse.json({ error: "Loan not found." }, { status: 404 });
    }

    const updateData = { status, approvedBy: adminUser.id };
    const chama = await Chama.findById(chamaId);

    if (status === 'rejected') {
        updateData.rejectionReason = rejectionReason || 'No reason provided.';
    }

    if (status === 'approved') {
        if (chama.currentBalance < loan.amount) {
            return NextResponse.json({ error: "Insufficient funds in the chama to approve this loan." }, { status: 400 });
        }
        // Deduct from chama balance
        await Chama.findByIdAndUpdate(chamaId, { $inc: { currentBalance: -loan.amount } });
    }
    
    if (status === 'repaid') {
        // Add back to chama balance
        await Chama.findByIdAndUpdate(chamaId, { $inc: { currentBalance: loan.amount } });
        updateData['repaymentDetails.repaidAmount'] = loan.amount;
        updateData['repaymentDetails.repaidDate'] = new Date();
    }

    const updatedLoan = await Loan.findByIdAndUpdate(
      loanId,
      { $set: updateData },
      { new: true }
    );

    // Send email notification
    if (loan.userId && loan.userId.email) {
        await sendLoanStatusEmail({
            to: loan.userId.email,
            memberName: loan.userId.firstName,
            chamaName: chama.name,
            loanAmount: loan.amount,
            status: status,
            reason: rejectionReason
        });
    }

    return NextResponse.json({ loan: updatedLoan });
  } catch (error) {
    console.error("Failed to update loan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
