// File Path: src/app/api/chamas/[id]/rotation/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import { getServerSideUser } from '@/lib/auth';

// Helper function to check for chairperson role for a specific Chama
const isChairperson = async (userId, chamaId) => {
    const membership = await ChamaMember.findOne({ userId, chamaId });
    return membership && membership.role === 'chairperson';
};

// PUT: Handles setting or updating the rotation order for members.
// It accepts a `randomize` flag to determine if the order should be shuffled.
export async function PUT(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = params;
        const { rotationOrder, randomize } = await request.json(); // Expects an array of member user IDs and a boolean

        if (!user || !(await isChairperson(user.id, chamaId))) {
            return NextResponse.json({ error: "Unauthorized: Only the chairperson can set the rotation order." }, { status: 403 });
        }

        if (!Array.isArray(rotationOrder)) {
            return NextResponse.json({ error: "Invalid rotation order provided. An array of member IDs is expected." }, { status: 400 });
        }
        
        let finalOrder = rotationOrder;

        // If the 'randomize' flag is true, shuffle the provided order.
        // Otherwise, use the order exactly as it was received (manual drag-and-drop).
        if (randomize) {
            // Simple Fisher-Yates shuffle algorithm for robust randomization
            for (let i = finalOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [finalOrder[i], finalOrder[j]] = [finalOrder[j], finalOrder[i]];
            }
        }

        const updatedChama = await Chama.findByIdAndUpdate(
            chamaId,
            { 
                'rotationPayout.rotationOrder': finalOrder,
                'rotationPayout.currentRecipientIndex': 0 // Always reset index when the order is changed
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

// POST: Advances the rotation to the next member in the existing order.
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = params;

        if (!user || !(await isChairperson(user.id, chamaId))) {
            return NextResponse.json({ error: "Unauthorized: Only the chairperson can advance the rotation." }, { status: 403 });
        }

        const chama = await Chama.findById(chamaId);
        if (!chama || chama.operationType !== 'rotation_payout') {
            return NextResponse.json({ error: "Chama not found or is not a rotation-payout type." }, { status: 404 });
        }

        const { rotationOrder, currentRecipientIndex } = chama.rotationPayout;
        
        if (!rotationOrder || rotationOrder.length === 0) {
            return NextResponse.json({ error: "Rotation order has not been set yet." }, { status: 400 });
        }

        // Calculate the next index, wrapping around to the start if at the end of the list
        const nextIndex = (currentRecipientIndex + 1) % rotationOrder.length;

        chama.rotationPayout.currentRecipientIndex = nextIndex;
        await chama.save();
        
        // TODO: Create a "payout" transaction record and notify the new recipient.

        return NextResponse.json({ message: "Rotation advanced to the next member successfully.", chama });

    } catch (error) {
        console.error("Failed to advance rotation:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

