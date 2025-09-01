import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import User from '@/models/User';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import { getServerSideUser } from '@/lib/auth';
import { sendChamaInvitationEmail } from '@/lib/email';

// GET: Fetch all members of a specific Chama
export async function GET(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id } = await params; // This is the Chama ID

        const currentUserMembership = await ChamaMember.findOne({ userId: user.id, chamaId: id });
        if (!currentUserMembership) {
            return NextResponse.json({ error: "Access Forbidden: You are not a member of this Chama." }, { status: 403 });
        }

        const members = await ChamaMember.find({ chamaId: id })
            .populate({
                path: 'userId',
                select: 'firstName lastName phoneNumber email photoUrl',
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
        const inviter = await getServerSideUser();
        if (!inviter) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        
        const { id } =await params; // Chama ID
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required to invite a member." }, { status: 400 });
        }

        const membership = await ChamaMember.findOne({ userId: inviter.id, chamaId: id });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can invite new members." }, { status: 403 });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return NextResponse.json({ error: `A user with the email "${email}" was not found.` }, { status: 404 });
        }

        const existingMember = await ChamaMember.findOne({ userId: userToInvite._id, chamaId: id });
        if (existingMember) {
            return NextResponse.json({ error: "This user is already a member of this Chama." }, { status: 409 });
        }

        const newMember = await ChamaMember.create({
            chamaId: id,
            userId: userToInvite._id,
            role: 'member',
        });

        const chama = await Chama.findById(id);
        try {
            await sendChamaInvitationEmail({
                to: userToInvite.email,
                inviterName: inviter.firstName,
                chamaName: chama.name,
            });
        } catch (emailError) {
            console.error("Invitation was created, but failed to send email:", emailError);
        }

        return NextResponse.json({ message: `${userToInvite.firstName} has been invited successfully.`, member: newMember }, { status: 201 });

    } catch (error) {
        console.error("Failed to invite member:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove a member from a Chama
export async function DELETE(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id: chamaId } =await params; // Chama ID
        const { memberId } = await request.json(); // The ID of the ChamaMember record to delete

        if (!memberId) {
            return NextResponse.json({ error: "Member ID is required." }, { status: 400 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can remove members." }, { status: 403 });
        }

        const memberToDelete = await ChamaMember.findById(memberId);
        if (!memberToDelete) {
             return NextResponse.json({ error: "Member not found." }, { status: 404 });
        }

        if (String(memberToDelete.userId) === user.id) {
            return NextResponse.json({ error: "Chairperson cannot remove themselves." }, { status: 400 });
        }

        await ChamaMember.findByIdAndDelete(memberId);

        return NextResponse.json({ message: "Member removed successfully." });

    } catch (error) {
        console.error("Failed to remove member:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
