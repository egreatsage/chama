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

        const { id } = params; // This is the Chama ID

        // Security Check: Verify that the current user is a member of this Chama
        const currentUserMembership = await ChamaMember.findOne({ userId: user.id, chamaId: id });
        if (!currentUserMembership) {
            return NextResponse.json({ error: "Access Forbidden" }, { status: 403 });
        }

        const members = await ChamaMember.find({ chamaId: id })
            .populate({
                path: 'userId',
                select: 'firstName lastName email photoUrl',
                model: User
            });

        return NextResponse.json({ members });

    } catch (error) {
        console.error("Failed to fetch members:", error);
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
        
        const { id } = params; // Chama ID
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