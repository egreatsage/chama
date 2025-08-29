import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import { getServerSideUser } from '@/lib/auth';

export async function GET() {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Find all memberships for the current user
        const memberships = await ChamaMember.find({ userId: user.id });

        // Get an array of just the chamaIds
        const chamaIds = memberships.map(member => member.chamaId);

        // Find all Chamas that match the IDs from the memberships
        const chamas = await Chama.find({
            '_id': { $in: chamaIds }
        }).sort({ createdAt: -1 });

        return NextResponse.json({ chamas });

    } catch (error) {
        console.error("Failed to fetch user's chamas:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}