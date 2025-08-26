// src/app/api/chamas/route.js

import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import { getServerSideUser } from '@/lib/auth';

export async function POST(request) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, description, contributionAmount, contributionFrequency } = await request.json();
    if (!name || !contributionAmount || !contributionFrequency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the new Chama with a 'pending' status for admin approval
    const newChama = await Chama.create({
      name,
      description,
      createdBy: user.id,
      contributionAmount: Number(contributionAmount),
      contributionFrequency,
      status: 'pending', // A system admin will need to approve this
    });

    // Automatically make the creator the chairperson of the new Chama
    await ChamaMember.create({
        chamaId: newChama._id,
        userId: user.id,
        role: 'chairperson',
        status: 'active'
    });

    return NextResponse.json({
      message: 'Chama created successfully and is pending approval.',
      chama: newChama
    }, { status: 201 });

  } catch (error) {
    if (error.code === 11000) { // Handle duplicate Chama name error
        return NextResponse.json({ error: "A Chama with this name already exists." }, { status: 409 });
    }
    console.error("Failed to create Chama:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}