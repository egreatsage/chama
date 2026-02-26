// src/app/api/chamas/[id]/rotation/route.js

import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
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

// PUT: Updates the rotation order
export async function PUT(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = await params;
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


// POST: Executes the payout, creates a historical record, and advances the rotation.
// NOTE: This endpoint intentionally allows payouts even when some members have not
// fully paid. The frontend warns the chairperson before confirming. The payout
// amount disbursed is capped to the actual available balance if it falls short of
// the target, and the shortfall is recorded for transparency.
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = await params;

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

        const frequency = chama.rotationPayout?.payoutFrequency || 'monthly';
        const { start } = getCurrentPeriod(frequency);

        const { rotationOrder, currentRecipientIndex } = chama.rotationPayout;

        if (!rotationOrder || rotationOrder.length === 0) {
            return NextResponse.json({ error: "Rotation order is not set." }, { status: 400 });
        }

        const targetAmount = chama.rotationPayout.targetAmount || 0;
        if (targetAmount <= 0) {
            return NextResponse.json({ error: "Payout amount (targetAmount) is not set for this rotation." }, { status: 400 });
        }

        // CHANGED: Instead of blocking when balance < targetAmount, we cap the
        // actual payout to whatever is currently available. This allows the
        // chairperson to proceed even when some members haven't paid yet.
        // The shortfall (if any) is recorded on the cycle for auditing.
        const currentBalance = chama.currentBalance || 0;

        if (currentBalance <= 0) {
            return NextResponse.json({
                error: "Cannot execute payout: the chama balance is currently zero."
            }, { status: 400 });
        }

        // Actual amount disbursed — whichever is lower: target or available balance
        const actualAmount = Math.min(currentBalance, targetAmount);
        const shortfall = targetAmount - actualAmount;

        const recipientUserId = rotationOrder[currentRecipientIndex];
        const recipientUser = await User.findById(recipientUserId);

        // Create the historical ChamaCycle record, capturing any shortfall
        await ChamaCycle.create({
            chamaId,
            cycleType: 'rotation_cycle',
            cycleNumber: currentRecipientIndex + 1,
            startDate: start,
            endDate: new Date(),
            recipientId: recipientUserId,
            expectedAmount: targetAmount,
            actualAmount: actualAmount,   // May be less than target if members hadn't all paid
            status: shortfall > 0 ? 'partial' : 'completed',
            // Store shortfall metadata if your schema supports a notes/meta field:
            ...(shortfall > 0 && { notes: `Shortfall of KES ${shortfall} due to unpaid contributions.` }),
        });

        // Deduct the actual disbursed amount from the balance
        chama.currentBalance = Math.max(0, currentBalance - actualAmount);

        // Advance the rotation index to the next member
        const nextIndex = (currentRecipientIndex + 1) % rotationOrder.length;
        chama.rotationPayout.currentRecipientIndex = nextIndex;
        if (!chama.cycleCount) chama.cycleCount = 1; // Safety check
        chama.cycleCount += 1;

        await chama.save();

        // Send notification email to the recipient
        if (recipientUser) {
            await sendRotationPayoutEmail({
                to: recipientUser.email,
                memberName: recipientUser.firstName,
                chamaName: chama.name,
                amount: actualAmount,
                rotationNumber: currentRecipientIndex + 1,
                totalMembers: rotationOrder.length,
            });
        }

        const message = shortfall > 0
            ? `Payout of KES ${actualAmount} made to ${recipientUser?.firstName || 'recipient'} (KES ${shortfall} short of target due to unpaid contributions). Rotation advanced.`
            : `Payout of KES ${actualAmount} successfully made to ${recipientUser?.firstName || 'recipient'}. Rotation advanced.`;

        return NextResponse.json({ message });

    } catch (error) {
        console.error("Failed to execute payout and advance rotation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}