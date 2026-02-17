import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import Contribution from "@/models/Contribution";
import Withdrawal from "@/models/Withdrawal";
import Loan from "@/models/Loan";
import ChamaCycle from "@/models/ChamaCycle";
import Announcement from "@/models/Announcement";
import Poll from "@/models/Poll";
import Post from "@/models/Post";
import User from "@/models/User"; // Ensure User model is registered

const isSystemAdmin = (user) => user && user.role === 'admin';

export async function GET(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user || !isSystemAdmin(user)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;

        // 1. Fetch the Chama itself
        const chama = await Chama.findById(id).populate('createdBy', 'firstName lastName email phoneNumber photoUrl');

        if (!chama) {
            return NextResponse.json({ error: "Chama not found" }, { status: 404 });
        }

        // 2. Run all other queries in parallel for performance
        const [
            members,
            contributions,
            withdrawals,
            loans,
            cycles,
            announcements,
            polls,
            posts
        ] = await Promise.all([
            ChamaMember.find({ chamaId: id }).populate('userId', 'firstName lastName email phoneNumber photoUrl').sort({ joinedAt: -1 }),
            Contribution.find({ chamaId: id }).populate('userId', 'firstName lastName').sort({ createdAt: -1 }),
            Withdrawal.find({ chamaId: id }).populate('userId', 'firstName lastName').sort({ createdAt: -1 }),
            Loan.find({ chamaId: id }).populate('userId', 'firstName lastName').populate('guarantors.userId', 'firstName lastName').sort({ createdAt: -1 }),
            ChamaCycle.find({ chamaId: id }).sort({ cycleNumber: -1 }),
            Announcement.find({ chamaId: id }).populate('createdBy', 'firstName lastName').sort({ createdAt: -1 }),
            Poll.find({ chamaId: id }).populate('createdBy', 'firstName lastName').sort({ createdAt: -1 }),
            Post.find({ chamaId: id }).populate('authorId', 'firstName lastName').sort({ createdAt: -1 })
        ]);

        return NextResponse.json({
            chama,
            stats: {
                totalMembers: members.length,
                totalContributions: contributions.reduce((acc, curr) => acc + (curr.amount || 0), 0),
                totalLoans: loans.reduce((acc, curr) => acc + (curr.amount || 0), 0),
                activeLoans: loans.filter(l => l.status === 'approved').length,
            },
            data: {
                members,
                contributions,
                withdrawals,
                loans,
                cycles,
                announcements,
                polls,
                posts
            }
        });

    } catch (error) {
        console.error("Failed to fetch full Chama details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}