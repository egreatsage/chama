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

        const { id } = await params; // This is the Chama ID

        // Security Check: Verify that the current user is a member of this Chama
        const currentUserMembership = await ChamaMember.findOne({ userId: user.id, chamaId: id });
        if (!currentUserMembership) {
            return NextResponse.json({ error: "Access Forbidden: You are not a member of this Chama." }, { status: 403 });
        }

        // Fetch all members and populate their user details
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
        
        const { id } = await params; // Chama ID
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required to invite a member." }, { status: 400 });
        }

        // Security Check: Verify the user is the chairperson of this Chama
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId: id });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can invite new members." }, { status: 403 });
        }

        // Find the user to invite by their email
        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return NextResponse.json({ error: `A user with the email "${email}" was not found.` }, { status: 404 });
        }

        // Check if the user is already a member
        const existingMember = await ChamaMember.findOne({ userId: userToInvite._id, chamaId: id });
        if (existingMember) {
            return NextResponse.json({ error: "This user is already a member of this Chama." }, { status: 409 });
        }

        // Create the new membership record
        const newMember = await ChamaMember.create({
            chamaId: id,
            userId: userToInvite._id,
            role: 'member', // New members default to the 'member' role
        });

        // TODO: Send an email notification to the invited user

        return NextResponse.json({ message: `${userToInvite.firstName} has been successfully invited to the Chama.`, member: newMember }, { status: 201 });

    } catch (error) {
        console.error("Failed to invite member:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}