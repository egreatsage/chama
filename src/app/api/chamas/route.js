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

    if (operationType === 'equal_sharing') {
      chamaData.equalSharing = {
          targetAmount: typeSpecificConfig.targetAmount,
          savingStartDate: typeSpecificConfig.savingStartDate,
          savingEndDate: typeSpecificConfig.savingEndDate,
      };
    } else if (operationType === 'rotation_payout') {
      chamaData.rotationPayout = {
          targetAmount: typeSpecificConfig.targetAmount,
          payoutAmount: typeSpecificConfig.payoutAmount, // Or calculate based on contributionAmount * members
          savingStartDate: typeSpecificConfig.savingStartDate,
          payoutFrequency: contributionFrequency, // Using contributionFrequency as payoutFrequency
      };
    } 

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
