import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Chama from '@/models/Chama';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { sendChamaInvitationEmail } from '@/lib/email';

export async function POST(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: chamaId }  = await params;
    const { email: inviteeEmail } = await request.json();

    if (!inviteeEmail) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    try {
        const chama = await Chama.findById(chamaId);
        if (!chama) {
            return NextResponse.json({ error: 'Chama not found' }, { status: 404 });
        }

        // Check if user is chairperson
        const member = chama.members.find(m => m.userId.toString() === session.user.id);
        if (!member || member.role !== 'chairperson') {
            return NextResponse.json({ error: 'Only the chairperson can invite members' }, { status: 403 });
        }
        
        const inviter = await User.findById(session.user.id);
        if (!inviter) {
            return NextResponse.json({ error: 'Inviter not found' }, { status: 404 });
        }

        // Check if the user is already a member
        const existingUser = await User.findOne({ email: inviteeEmail });
        if (existingUser) {
            const isAlreadyMember = chama.members.some(m => m.userId.toString() === existingUser._id.toString());
            if (isAlreadyMember) {
                return NextResponse.json({ error: 'User is already a member of this chama' }, { status: 409 });
            }
        }

        const inviterName = `${inviter.firstName} ${inviter.lastName}`;
        const invitationLink = `${process.env.NEXTAUTH_URL}/register?chamaId=${chamaId}`;

        await sendChamaInvitationEmail({
            to: inviteeEmail,
            inviterName,
            chamaName: chama.name,
            invitationLink,
        });

        return NextResponse.json({ message: `Invitation sent to ${inviteeEmail}` });

    } catch (error) {
        console.error('Error inviting member:', error);
        return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 });
    }
}
