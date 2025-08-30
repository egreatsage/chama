// File Path: src/app/api/chamas/[id]/rules/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import ChamaRules from "@/models/ChamaRules";
import ChamaMember from "@/models/ChamaMember";

// GET: Fetch the rules for a specific Chama
export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = params;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Authorization: User must be a member to view rules
    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
    }

    // Find rules, or create a default set if none exist
    let rules = await ChamaRules.findOne({ chamaId });
    if (!rules) {
      rules = await ChamaRules.create({ chamaId });
    }

    return NextResponse.json({ rules });

  } catch (error) {
    console.error("Failed to fetch chama rules:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update the rules for a specific Chama
export async function PUT(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = params;
    const body = await request.json();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Authorization: Only chairperson can update rules
    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership || membership.role !== 'chairperson') {
      return NextResponse.json({ error: "Only the chairperson can update rules." }, { status: 403 });
    }

    const updatedRules = await ChamaRules.findOneAndUpdate(
      { chamaId },
      { $set: body },
      { new: true, upsert: true, runValidators: true } // upsert: true creates if it doesn't exist
    );

    return NextResponse.json({ message: "Rules updated successfully.", rules: updatedRules });

  } catch (error) {
    console.error("Failed to update chama rules:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
