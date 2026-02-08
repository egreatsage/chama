// File Path: src/app/api/chamas/[id]/loans/[loanId]/guarantor/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Loan from "@/models/Loan";
import Chama from "@/models/Chama";
import { logAuditEvent } from '@/lib/auditLog'
import { sendGuarantorResponseEmail } from '@/lib/email';
import User from '@/models/User';

export async function POST(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { loanId, id: chamaId } = await params; // 'id' is chamaId
    const { status, reason } = await request.json(); // status: 'accepted' or 'rejected'

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!['accepted', 'rejected'].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 1. Fetch the Loan
    const loan = await Loan.findOne({ _id: loanId, chamaId });
    if (!loan) {
        return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // 2. Verify the User is a Guarantor for this loan
    const guarantorIndex = loan.guarantors.findIndex(g => g.userId.toString() === user.id);
    
    if (guarantorIndex === -1) {
        return NextResponse.json({ error: "You are not listed as a guarantor for this loan." }, { status: 403 });
    }

    // 3. Update the Guarantor's Status
    loan.guarantors[guarantorIndex].status = status;
    loan.guarantors[guarantorIndex].responseDate = new Date();
    
    await loan.save();

    // 4. Notify the Borrower (Email)
    try {
        // Fetch borrower and chama details for the email
        const borrower = await User.findById(loan.userId);
        const chama = await Chama.findById(chamaId);
        
        if (borrower && chama) {
            await sendGuarantorResponseEmail({
                to: borrower.email,
                borrowerName: borrower.firstName,
                guarantorName: `${user.firstName} ${user.lastName}`,
                status: status,
                amount: loan.amount,
                chamaName: chama.name,
                reason: reason || undefined
            });
        }
    } catch (emailError) {
        // Log error but don't block the response
        console.error("Failed to send guarantor response email:", emailError);
    }

    // 5. Audit Log
    await logAuditEvent({
        chamaId,
        userId: user.id,
        action: `GUARANTOR_${status.toUpperCase()}`,
        category: 'LOAN',
        description: `Guarantor ${user.firstName} ${status} loan request for amount ${loan.amount}`,
        metadata: { loanId, reason }
    });

    return NextResponse.json({ message: "Success", loan });
  } catch (error) {
    console.error("Guarantor action failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}