// src/app/api/withdrawals/[id]/route.js

import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Withdrawal from "@/models/Withdrawal";
import { getServerSideUser, hasElevatedPrivileges } from '@/lib/auth';

export async function PUT(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    // Ensure the user is an admin or treasurer
    if (!user || !hasElevatedPrivileges(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const { status } = await request.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedWithdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Withdrawal has been ${status}.`,
      withdrawal: updatedWithdrawal
    });

  } catch (error) {
    console.error("Failed to update withdrawal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}