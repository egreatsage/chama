// File Path: src/app/api/withdrawals/[id]/route.js
import { NextResponse } from 'next/server';
// ... existing imports
import { logAuditEvent } from '@/lib/auditLog'; // Import the audit logger
import Withdrawal from '@/models/Withdrawal';
import { connectDB } from '@/lib/dbConnect';
import { getServerSideUser } from '@/lib/auth';


const hasElevatedPrivileges = (user) => {
  return user && ['admin', 'treasurer'].includes(user.role);
};


// PUT: Handle both status updates and amount edits
export async function PUT(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user || !hasElevatedPrivileges(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { status, amount } = await request.json();

    const originalWithdrawal = await Withdrawal.findById(id).lean();
    if (!originalWithdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    const updateData = {};
    if (status && ['approved', 'rejected', 'pending'].includes(status)) {
      updateData.status = status;
    }
    if (amount && !isNaN(amount) && Number(amount) > 0) {
      updateData.amount = Number(amount);
    }

    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(id, updateData, { new: true });

    // --- AUDIT LOGGING ---
    await logAuditEvent({
        chamaId: updatedWithdrawal.chamaId,
        userId: updatedWithdrawal.userId,
        adminId: user.id,
        action: 'WITHDRAWAL_STATUS_UPDATE',
        category: 'WITHDRAWAL',
        amount: updatedWithdrawal.amount,
        description: `Admin updated withdrawal request. Status changed to ${status || 'unchanged'}. Amount changed to ${amount || 'unchanged'}.`,
        before: originalWithdrawal,
        after: updatedWithdrawal.toObject()
    });
    // --- END AUDIT LOGGING ---

    return NextResponse.json({
      message: 'Withdrawal updated successfully.',
      withdrawal: updatedWithdrawal
    });

  } catch (error) {
    console.error("Failed to update withdrawal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove a withdrawal request
export async function DELETE(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user || !hasElevatedPrivileges(user)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        
        const withdrawalToDelete = await Withdrawal.findById(id);
        if (!withdrawalToDelete) {
             return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
        }

        await Withdrawal.findByIdAndDelete(id);

        // --- AUDIT LOGGING ---
        await logAuditEvent({
            chamaId: withdrawalToDelete.chamaId,
            userId: withdrawalToDelete.userId,
            adminId: user.id,
            action: 'WITHDRAWAL_DELETE',
            category: 'WITHDRAWAL',
            amount: withdrawalToDelete.amount,
            description: `Admin deleted a withdrawal request of KES ${withdrawalToDelete.amount}.`,
            before: withdrawalToDelete.toObject()
        });
        // --- END AUDIT LOGGING ---

        return NextResponse.json({ message: "Withdrawal request deleted successfully." });

    } catch (error) {
        console.error("Failed to delete withdrawal:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

