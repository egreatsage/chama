// File Path: src/app/api/chamas/[id]/rotation/route.js
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
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            start = startOfWeek;
            end = endOfWeek;
            break;
            
        case 'monthly':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
            
        default:
            // Fallback to current month
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    return { start, end };
};
const periodResult = getCurrentPeriod(chama.contributionFrequency);
if (!periodResult) {
    return NextResponse.json({ error: "Unable to determine current contribution period." }, { status: 500 });
}
const { start, end } = periodResult;

// PUT: Handles setting or updating the rotation order (remains unchanged)
export async function PUT(request, { params }) { /* ... existing code ... */ }

// POST: Executes the payout and advances the rotation
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = await params;

        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const chama = await Chama.findById(chamaId);
        if (!chama) return NextResponse.json({ error: "Chama not found." }, { status: 404 });
        
        // 1. Authorization Check
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can execute a payout." }, { status: 403 });
        }
        
        // 2. Contribution Check: Verify all members have paid for the current period
        const { start, end } = getCurrentPeriod(chama.contributionFrequency);
        const activeMembers = await ChamaMember.find({ chamaId, status: 'active' });
        const contributionsInPeriod = await Contribution.find({ chamaId, status: 'confirmed', createdAt: { $gte: start, $lte: end } });
        
        if (contributionsInPeriod.length < activeMembers.length) {
            return NextResponse.json({ error: "Cannot proceed. Not all members have made their contribution for this period." }, { status: 400 });
        }

        // 3. Payout Logic
        const { rotationOrder, currentRecipientIndex } = chama.rotationPayout;
        const recipientUserId = rotationOrder[currentRecipientIndex];
        const recipientUser = await User.findById(recipientUserId);
        const totalPot = chama.contributionAmount * activeMembers.length;

        // 4. Create Historical Record
        await ChamaCycle.create({
            chamaId,
            type: 'rotation_cycle',
            cycleNumber: currentRecipientIndex + 1,
            startDate: start,
            endDate: new Date(),
            recipientId: recipientUserId,
            expectedAmount: totalPot,
            actualAmount: totalPot,
            status: 'completed'
        });

        // 5. Advance the Rotation
        const nextIndex = (currentRecipientIndex + 1) % rotationOrder.length;
        chama.rotationPayout.currentRecipientIndex = nextIndex;
        
        // Reset chama's current balance after payout
        chama.currentBalance = 0; // Or deduct totalPot from it
        
        await chama.save();
        
        // 6. Send Email Notification
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

        return NextResponse.json({ message: `Payout successfully made to ${recipientUser.firstName}. Rotation advanced.` });

    } catch (error) {
        console.error("Failed to advance rotation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
