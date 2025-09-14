// src/app/api/chamas/route.js

import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import ChamaRules from "@/models/ChamaRules";
import { getServerSideUser } from '@/lib/auth';

export async function POST(request) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, operationType, contributionFrequency, typeSpecificConfig } = body;
    
    if (!name || !operationType) {
      return NextResponse.json({ error: "Chama Name and Operation Type are required." }, { status: 400 });
    }

    const chamaData = {
      name,
      description,
      createdBy: user.id,
      operationType,
      contributionFrequency: contributionFrequency || 'monthly',
      status: 'pending',
    };

    // --- THIS IS THE CORRECTED SECTION ---
    if (operationType === 'equal_sharing') {
      chamaData.equalSharing = {
          currentCycle: { // Directly create the nested currentCycle object
              targetAmount: typeSpecificConfig.targetAmount,
              startDate: typeSpecificConfig.savingStartDate || new Date(),
              endDate: typeSpecificConfig.savingEndDate,
          }
      };
    } else if (operationType === 'rotation_payout') {
      chamaData.rotationPayout = {
          targetAmount: typeSpecificConfig.targetAmount,
          // Payout amount logic might need refinement based on your business rules
          payoutAmount: typeSpecificConfig.payoutAmount || typeSpecificConfig.targetAmount, 
          savingStartDate: typeSpecificConfig.savingStartDate || new Date(),
          payoutFrequency: contributionFrequency,
      };
    } 
    // --- END OF CORRECTION ---

    const newChama = await Chama.create(chamaData);

    await ChamaMember.create({
        chamaId: newChama._id,
        userId: user.id,
        role: 'chairperson',
        status: 'active'
    });

    await ChamaRules.create({
        chamaId: newChama._id,
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