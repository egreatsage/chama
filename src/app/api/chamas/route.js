import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember"; // 1. Import the ChamaMember model
import { getServerSideUser } from '@/lib/auth';

// POST: Handles the creation of a new Chama
export async function POST(request) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, description, contributionAmount, contributionFrequency } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Chama name is required" }, { status: 400 });
    }

    // 2. Create the Chama document
    const newChama = await Chama.create({
      name,
      description,
      createdBy: user.id,
      contributionAmount: contributionAmount ? Number(contributionAmount) : 0,
      contributionFrequency: contributionFrequency || 'monthly',
      status: 'pending', // A system admin will approve this
    });

    // 3. CRITICAL: Create the ChamaMember record for the creator
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
    if (error.code === 11000) {
        return NextResponse.json({ error: "A Chama with this name already exists." }, { status: 409 });
    }
    console.error("Failed to create Chama:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}