// src/app/api/withdrawals/[id]/route.js

import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Withdrawal from "@/models/Withdrawal";
import User from '@/models/User';
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

    const { id } = params;
    const { status, amount } = await request.json();

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

    if (!updatedWithdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

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

        const { id } = params;
        const deletedWithdrawal = await Withdrawal.findByIdAndDelete(id);

        if (!deletedWithdrawal) {
            return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Withdrawal request deleted successfully." });

    } catch (error) {
        console.error("Failed to delete withdrawal:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}