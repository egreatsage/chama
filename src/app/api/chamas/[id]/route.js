// File Path: src/app/api/chamas/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import User from '@/models/User';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import { getServerSideUser } from '@/lib/auth';

// GET: Fetch details for a specific Chama
export async function GET(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id: chamaId } =await params;
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });

        if (!membership) {
            return NextResponse.json({ error: "Access Forbidden: You are not a member of this Chama." }, { status: 403 });
        }

        const chama = await Chama.findById(chamaId);
        if (!chama) {
            return NextResponse.json({ error: "Chama not found" }, { status: 404 });
        }

        const userRoleForThisChama = membership.role || 'member';

        const chamaData = { 
            ...chama.toObject(), 
            userRole: userRoleForThisChama 
        };
        
        return NextResponse.json({ chama: chamaData });

    } catch (error) {
        console.error("Failed to fetch Chama details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Invite a new member to the Chama
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        
        // --- FIX: Removed incorrect `await` from params ---
        const { id: chamaId } = params;
        const { email } = await request.json();

        // Security Check: Verify user is an admin for this chama
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || membership.role !== 'chairperson') { // Changed from 'admin' to 'chairperson' to be consistent
            return NextResponse.json({ error: "Only the chairperson can invite members." }, { status: 403 });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return NextResponse.json({ error: `User with email "${email}" not found.` }, { status: 404 });
        }

        const existingMember = await ChamaMember.findOne({ userId: userToInvite._id, chamaId });
        if (existingMember) {
            return NextResponse.json({ error: "This user is already a member of the Chama." }, { status: 409 });
        }

        const newMember = await ChamaMember.create({
            chamaId,
            userId: userToInvite._id,
            role: 'member',
        });

        return NextResponse.json({ message: `${userToInvite.firstName} has been invited successfully.`, member: newMember }, { status: 201 });

    } catch (error) {
        console.error("Failed to invite member:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

