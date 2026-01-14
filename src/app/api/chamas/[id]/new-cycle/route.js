// File Path: src/app/api/chamas/[id]/new-cycle/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import { logAuditEvent } from '@/lib/auditLog';

// POST: Starts a new savings cycle for an Equal Sharing chama
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = await params;
        const { targetAmount, endDate } = await request.json();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can start a new cycle." }, { status: 403 });
        }

        const chama = await Chama.findById(chamaId);
        if (!chama || chama.operationType !== 'equal_sharing') {
            return NextResponse.json({ error: "This action is only for Equal Sharing chamas." }, { status: 400 });
        }

        if (chama.equalSharing.currentCycle && chama.equalSharing.currentCycle.targetAmount > 0) {
            return NextResponse.json({ error: "A cycle is already active. Distribute the current cycle before starting a new one." }, { status: 400 });
        }

        if (chama.currentBalance > 0) {
            return NextResponse.json({ error: "Cannot start a new cycle until the current balance is distributed." }, { status: 400 });
        }

        if (!targetAmount || !endDate) {
            return NextResponse.json({ error: "New target amount and end date are required." }, { status: 400 });
        }

        // Update the chama with the new cycle's information
        chama.equalSharing.currentCycle = {
            targetAmount: Number(targetAmount),
            startDate: new Date(),
            endDate: new Date(endDate),
        };
        chama.cycleCount += 1; // Increment the cycle counter

        await chama.save();
        
        // --- AUDIT LOGGING ---
        await logAuditEvent({
            chamaId,
            adminId: user.id,
            action: 'START_NEW_CYCLE',
            category: 'CHAMA_MANAGEMENT',
            description: `Started a new savings cycle (#${chama.cycleCount}) with a target of KES ${targetAmount}.`,
            after: chama.equalSharing.currentCycle
        });
        // --- END AUDIT LOGGING ---

        return NextResponse.json({ 
            message: `New savings cycle #${chama.cycleCount} has been started successfully!`,
            chama 
        });

    } catch (error) {
        console.error("Failed to start new cycle:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}