// src/app/api/chamas/[id]/loans/[loanId]/repay/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { checkChamaRole } from '@/lib/checkChamaRole';
import Loan from "@/models/Loan";
import Transaction from "@/models/Transaction";
import Chama from "@/models/Chama";
import { logAuditEvent } from '@/lib/auditLog';

export async function POST(request, { params }) {
  await connectDB();
  try {
    const { id: chamaId, loanId } = params;
    const { amount, paymentMethod = 'cash' } = await request.json();

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "A valid amount is required." }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);

    // 1. Authenticate and authorize the user (must be chairperson or treasurer)
    const { authorized, error, memberId, userId } = await checkChamaRole(chamaId, ['chairperson', 'treasurer']);
    if (!authorized) {
      return NextResponse.json({ error: error || "Not authorized" }, { status: 403 });
    }

    // 2. Find the loan
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }
     if (loan.chamaId.toString() !== chamaId) {
      return NextResponse.json({ error: "Loan does not belong to this chama." }, { status: 400 });
    }

    // 3. Update the loan's totalPaid amount
    loan.totalPaid += parsedAmount;
    
    // Check if the loan is now fully repaid
    const totalOwed = (loan.totalExpectedRepayment || loan.amount) + (loan.penaltyAmount || 0);
    if (loan.totalPaid >= totalOwed) {
      loan.status = 'repaid';
    } else {
        // If partially paid, ensure it's marked as active
        loan.status = 'active';
    }

    await loan.save();

    // 4. Create a transaction record for this manual payment
    await Transaction.create({
      type: 'loan_repayment',
      referenceId: loan._id,
      userId: loan.userId, // The user who OWNS the loan
      chamaId: chamaId,
      amount: parsedAmount,
      paymentMethod: paymentMethod, // 'cash', 'bank', etc.
      status: 'completed',
    });

    // 5. Update the Chama's main balance
     await Chama.findByIdAndUpdate(chamaId, {
        $inc: { currentBalance: parsedAmount }
    });

    // 6. Log the audit event
    await logAuditEvent({
        chamaId,
        userId: userId, // The admin who is performing the action
        action: 'MANUAL_LOAN_REPAYMENT',
        category: 'LOAN',
        amount: parsedAmount,
        description: `Admin recorded a manual loan repayment of ${parsedAmount} for user ${loan.userId.toString()}`,
        after: loan.toObject()
    });

    return NextResponse.json({ loan }, { status: 200 });

  } catch (error) {
    console.error("Failed to record manual repayment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
