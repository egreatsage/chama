import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import User from '@/models/User';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import { getServerSideUser } from '@/lib/auth';

// GET: Fetch all members of a specific Chama
export async function GET(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id } = await params;

        // Security Check: This will now pass for the creator
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId: id });
        if (!membership) {
            return NextResponse.json({ error: "Access Forbidden: You are not a member of this Chama." }, { status: 403 });
        }

        const chama = await Chama.findById(id);
        if (!chama) {
            return NextResponse.json({ error: "Chama not found" }, { status: 404 });
        }

        const chamaData = { ...chama.toObject(), userRole: membership.role };

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
        
        const { id } = await params; // Chama ID
        const { email } = await request.json();

        // Security Check: Verify user is a admin
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId: id });
        if (!membership || membership.role !== 'admin') {
            return NextResponse.json({ error: "Only the admin can invite members." }, { status: 403 });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return NextResponse.json({ error: `User with email "${email}" not found.` }, { status: 404 });
        }

        // Check if user is already a member
        const existingMember = await ChamaMember.findOne({ userId: userToInvite._id, chamaId: id });
        if (existingMember) {
            return NextResponse.json({ error: "This user is already a member of the Chama." }, { status: 409 });
        }

        const newMember = await ChamaMember.create({
            chamaId: id,
            userId: userToInvite._id,
            role: 'member', // Default role for new invites
        });

        return NextResponse.json({ message: `${userToInvite.firstName} has been invited successfully.`, member: newMember }, { status: 201 });

    } catch (error) {
        console.error("Failed to invite member:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}