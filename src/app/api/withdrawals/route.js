// src/app/api/withdrawals/route.js

import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Withdrawal from "@/models/Withdrawal";
import { getServerSideUser } from '@/lib/auth';

// GET: Fetch all withdrawals for the logged-in user
export async function GET() {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const withdrawals = await Withdrawal.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ withdrawals });

  } catch (error) {
    console.error("Failed to fetch withdrawals:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new withdrawal request
export async function POST(request) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return NextResponse.json({ error: "A valid amount is required" }, { status: 400 });
    }

    const newWithdrawal = await Withdrawal.create({
      userId: user.id,
      amount: Number(amount),
      status: 'pending', // Default status
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully!',
      withdrawal: newWithdrawal
    }, { status: 201 });

  } catch (error) {
    console.error("Failed to create withdrawal request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}