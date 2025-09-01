// File Path: src/app/api/chamas/[id]/goals/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import User from '@/models/User';
import ChamaCycle from '@/models/ChamaCycle';

// GET: Fetch all purchase goals for a Chama
export async function GET(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = params;
        if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership) return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });

        const chama = await Chama.findById(chamaId).populate({
            path: 'groupPurchase.purchaseGoals.beneficiaryId',
            model: User,
            select: 'firstName lastName photoUrl'
        });

        if (!chama) return NextResponse.json({ error: "Chama not found." }, { status: 404 });

        // Ensure we always return an array, even if groupPurchase doesn't exist on the doc
        const goals = chama.groupPurchase?.purchaseGoals || [];
        const currentGoalId = chama.groupPurchase?.currentGoalId;

        return NextResponse.json({ goals, currentGoalId });
    } catch (error) {
        console.error("Failed to fetch goals:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Add a new purchase goal to the queue
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = params;
        const { beneficiaryId, itemDescription, targetAmount } = await request.json();

        if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can add new goals." }, { status: 403 });
        }

        const chama = await Chama.findById(chamaId);
        
        // Defensive check to ensure the groupPurchase object exists
        if (!chama.groupPurchase) {
            chama.groupPurchase = { purchaseGoals: [] };
        }

        const newGoal = {
            beneficiaryId,
            itemDescription,
            targetAmount: Number(targetAmount),
            status: 'queued',
            purchaseOrder: (chama.groupPurchase.purchaseGoals || []).length + 1
        };

        chama.groupPurchase.purchaseGoals.push(newGoal);

        // If this is the very first goal being added, make it the active one
        if (!chama.groupPurchase.currentGoalId) {
            const addedGoal = chama.groupPurchase.purchaseGoals[chama.groupPurchase.purchaseGoals.length - 1];
            addedGoal.status = 'active';
            chama.groupPurchase.currentGoalId = addedGoal._id;
        }

        await chama.save();
        return NextResponse.json({ message: "Goal added successfully.", chama });
    } catch (error) {
        console.error("Failed to add goal:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Mark the current goal as complete and advance to the next one
export async function PUT(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = params;

        if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can complete goals." }, { status: 403 });
        }

        const chama = await Chama.findById(chamaId);
        const currentGoalId = chama.groupPurchase?.currentGoalId;
        if (!currentGoalId) {
            return NextResponse.json({ error: "No active goal to complete." }, { status: 400 });
        }

        const currentGoal = chama.groupPurchase.purchaseGoals.id(currentGoalId);
        if (chama.currentBalance < currentGoal.targetAmount) {
            return NextResponse.json({ error: "Target amount has not been reached." }, { status: 400 });
        }
        
        currentGoal.status = 'completed';

        // Find the next goal in the queue that is not yet completed
        const nextGoal = chama.groupPurchase.purchaseGoals
            .filter(g => g.status === 'queued')
            .sort((a, b) => a.purchaseOrder - b.purchaseOrder)[0];

        // Update the current goal ID to the next one, or null if queue is empty
        chama.groupPurchase.currentGoalId = nextGoal ? nextGoal._id : null;
        if (nextGoal) {
            nextGoal.status = 'active';
        }

        // Create a historical record for this completed purchase
        await ChamaCycle.create({
            chamaId,
            cycleType: 'purchase_cycle',
            beneficiaryId: currentGoal.beneficiaryId,
            actualAmount: currentGoal.targetAmount,
            startDate: chama.createdAt, // This can be improved to track goal start date
            endDate: new Date()
        });

        // Deduct the cost from the chama's balance
        chama.currentBalance -= currentGoal.targetAmount;
        
        await chama.save();
        return NextResponse.json({ message: `Goal "${currentGoal.itemDescription}" completed.`, chama });
    } catch (error) {
        console.error("Failed to complete goal:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

