// File Path: src/app/api/chamas/[id]/polls/[pollId]/vote/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Poll from "@/models/Poll";
import Vote from "@/models/Vote";
import ChamaMember from "@/models/ChamaMember";

export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId, pollId } = params;
        const { optionIndex } = await request.json();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership) {
            return NextResponse.json({ error: "You must be a member to vote." }, { status: 403 });
        }

        const poll = await Poll.findById(pollId);
        if (!poll || poll.status === 'closed' || new Date() > poll.endDate) {
            return NextResponse.json({ error: "This poll is not active." }, { status: 400 });
        }
        
        // Check if user has already voted
        const existingVote = await Vote.findOne({ pollId, userId: user.id });
        if (existingVote) {
            return NextResponse.json({ error: "You have already voted in this poll." }, { status: 409 });
        }

        // Atomically update the vote count and record the vote
        const newVote = new Vote({ pollId, userId: user.id, optionIndex });
        
        const pollUpdateQuery = {
            $inc: { [`options.${optionIndex}.votes`]: 1 }
        };

        await Promise.all([
            newVote.save(),
            Poll.updateOne({ _id: pollId }, pollUpdateQuery)
        ]);

        return NextResponse.json({ message: "Vote cast successfully" });

    } catch (error) {
        console.error("Failed to cast vote:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
