// src/app/api/chamas/[id]/rotation/route.js

// ... (keep all imports and the getCurrentPeriod helper function)
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import Contribution from "@/models/Contribution";
import ChamaCycle from "@/models/ChamaCycle";
import User from "@/models/User";
import { sendRotationPayoutEmail } from '@/lib/email';

const getCurrentPeriod = (frequency) => {
    const now = new Date();
    let start, end;

    switch (frequency) {
        case 'weekly':
            const firstDayOfWeek = now.getDate() - now.getDay();
            start = new Date(now.setDate(firstDayOfWeek));
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;
        case 'quarterly':
            const quarter = Math.floor(now.getMonth() / 3);
            start = new Date(now.getFullYear(), quarter * 3, 1);
            end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'monthly':
        default:
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            break;
    }
    return { start, end };
};


// ... (keep the PUT function as is)
export async function PUT(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId }  = await params;
        const { rotationOrder, randomize } = await request.json();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Unauthorized: Only the chairperson can set the rotation order." }, { status: 403 });
        }

        if (!Array.isArray(rotationOrder)) {
            return NextResponse.json({ error: "Invalid rotation order provided." }, { status: 400 });
        }
        
        let finalOrder = rotationOrder;
        if (randomize) {
            for (let i = finalOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [finalOrder[i], finalOrder[j]] = [finalOrder[j], finalOrder[i]];
            }
        }

        const updatedChama = await Chama.findByIdAndUpdate(
            chamaId,
            { 
                'rotationPayout.rotationOrder': finalOrder,
                'rotationPayout.currentRecipientIndex': 0
            },
            { new: true }
        );

        if (!updatedChama) {
            return NextResponse.json({ error: "Chama not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Rotation order updated successfully.", chama: updatedChama });

    } catch (error) {
        console.error("Failed to update rotation order:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


// CORRECTED POST FUNCTION
// POST: Executes the payout, creates a historical record, and advances the rotation
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId }  = await params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const chama = await Chama.findById(chamaId);
        if (!chama) {
            return NextResponse.json({ error: "Chama not found." }, { status: 404 });
        }
        
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can execute a payout." }, { status: 403 });
        }
        
        const { start } = getCurrentPeriod(chama.contributionFrequency);
        const { rotationOrder, currentRecipientIndex } = chama.rotationPayout;
        
        if (!rotationOrder || rotationOrder.length === 0) {
            return NextResponse.json({ error: "Rotation order is not set." }, { status: 400 });
        }

        const recipientUserId = rotationOrder[currentRecipientIndex];
        const recipientUser = await User.findById(recipientUserId);
        
        // **FIX:** Calculate totalPot based on the targetAmount in the chama settings
        const totalPot = chama.rotationPayout.targetAmount || 0;
        if (totalPot <= 0) {
            return NextResponse.json({ error: "Payout amount (targetAmount) is not set for this rotation." }, { status: 400 });
        }
        
        // **FIX:** Create the historical ChamaCycle record for this payout
        await ChamaCycle.create({
            chamaId,
            cycleType: 'rotation_cycle',
            cycleNumber: currentRecipientIndex + 1, // Or a more sophisticated cycle counter
            startDate: start,
            endDate: new Date(),
            recipientId: recipientUserId,
            expectedAmount: totalPot,
            actualAmount: totalPot, // Assuming the full pot is paid out
            status: 'completed'
        });

        // Advance the rotation for the next cycle
        const nextIndex = (currentRecipientIndex + 1) % rotationOrder.length;
        chama.rotationPayout.currentRecipientIndex = nextIndex;
        // Optionally reset balance if you track contributions this way
        // chama.currentBalance = 0; 
        await chama.save();
        
        // Send notification email to the recipient
        if (recipientUser) {
            await sendRotationPayoutEmail({
                to: recipientUser.email,
                memberName: recipientUser.firstName,
                chamaName: chama.name,
                amount: totalPot,
                rotationNumber: currentRecipientIndex + 1,
                totalMembers: rotationOrder.length
            });
        }

        return NextResponse.json({ message: `Payout of KES ${totalPot} successfully made to ${recipientUser.firstName}. Rotation advanced.` });

    } catch (error) {
        console.error("Failed to execute payout and advance rotation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}