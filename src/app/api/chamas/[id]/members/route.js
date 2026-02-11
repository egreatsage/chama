import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import User from '@/models/User';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import { getServerSideUser } from '@/lib/auth';
import { sendChamaAdditionEmail, sendChamaInvitationEmail } from '@/lib/email';

// GET: Fetch all members of a specific Chama
export async function GET(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id } = await params;

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

// POST: Invite or Add a new member
export async function POST(request, { params }) {
    await connectDB();
    try {
        const inviter = await getServerSideUser();
        if (!inviter) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        
        const { id } = await params;
        const { email, action } = await request.json(); // action can be 'add' or 'invite'

        if (!email) {
            return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }

        const membership = await ChamaMember.findOne({ userId: inviter.id, chamaId: id });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can add or invite members." }, { status: 403 });
        }

        const chama = await Chama.findById(id);

        if (action === 'invite') {
            try {
                await sendChamaInvitationEmail({
                    to: email,
                    inviterName: inviter.firstName,
                    chamaName: chama.name,
                    invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/login?redirect=/chamas/${id}&invite=true`
                });
                return NextResponse.json({ 
                    message: `Invitation sent successfully to ${email}.` 
                }, { status: 200 });
            } catch (emailError) {
                console.error("Failed to send invitation email:", emailError);
                return NextResponse.json({ error: "Failed to send invitation email." }, { status: 500 });
            }
        } else {
            const userToAdd = await User.findOne({ email });
            if (!userToAdd) {
                return NextResponse.json({ error: `A user with the email "${email}" was not found. Use "Invite Member" instead to send them an invitation.` }, { status: 404 });
            }

            const existingMember = await ChamaMember.findOne({ userId: userToAdd._id, chamaId: id });
            if (existingMember) {
                return NextResponse.json({ error: "This user is already a member of this Chama." }, { status: 409 });
            }

            const newMember = await ChamaMember.create({
                chamaId: id,
                userId: userToAdd._id,
                role: 'member',
            });

            try {
                await sendChamaAdditionEmail({
                    to: userToAdd.email,
                    inviterName: inviter.firstName,
                    chamaName: chama.name,
                    memberName: userToAdd.firstName
                });
            } catch (emailError) {
                console.error("Member added but email failed:", emailError);
            }

            return NextResponse.json({ 
                message: `${userToAdd.firstName} has been added successfully.`, 
                member: newMember 
            }, { status: 201 });
        }

    } catch (error) {
        console.error("Failed to process request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Update a member's role (Enables Handover/Promotion)
export async function PUT(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id } = await params;
        const { memberId, newRole } = await request.json();

        if (!memberId || !newRole) {
            return NextResponse.json({ error: "Member ID and new role are required." }, { status: 400 });
        }

        const allowedRoles = ['member', 'treasurer', 'secretary', 'chairperson'];
        if (!allowedRoles.includes(newRole)) {
            return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
        }

        // Verify Requester is Chairperson
        const requesterMembership = await ChamaMember.findOne({ userId: user.id, chamaId: id });
        if (!requesterMembership || requesterMembership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can update member roles." }, { status: 403 });
        }

        // Find the member to update
        const memberToUpdate = await ChamaMember.findOne({ _id: memberId, chamaId: id });
        if (!memberToUpdate) {
            return NextResponse.json({ error: "Member not found in this chama." }, { status: 404 });
        }

        // Update the role
        memberToUpdate.role = newRole;
        await memberToUpdate.save();

        return NextResponse.json({ 
            message: "Member role updated successfully.", 
            member: memberToUpdate 
        });

    } catch (error) {
        console.error("Failed to update member role:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove a member
export async function DELETE(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id: chamaId } = await params;
        const { memberId } = await request.json();

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