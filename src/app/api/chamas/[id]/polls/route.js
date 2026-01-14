// File Path: src/app/api/chamas/[id]/polls/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Poll from "@/models/Poll";
import Vote from "@/models/Vote";
import ChamaMember from "@/models/ChamaMember";
import User from '@/models/User';

// GET: Fetch all polls and the user's votes for a Chama
export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId }  = await params;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
    }

    // Update status of expired polls
    await Poll.updateMany(
        { chamaId, status: 'active', endDate: { $lt: new Date() } },
        { $set: { status: 'closed' } }
    );
    
    const polls = await Poll.find({ chamaId })
      .populate({
        path: 'createdBy',
        select: 'firstName lastName',
        model: User
      })
      .sort({ createdAt: 'desc' });

    // Find which polls the current user has voted on
    const userVotes = await Vote.find({ userId: user.id, pollId: { $in: polls.map(p => p._id) } });
    
    const userVotesMap = userVotes.reduce((acc, vote) => {
        acc[vote.pollId.toString()] = vote.optionIndex;
        return acc;
    }, {});

    return NextResponse.json({ polls, userVotes: userVotesMap });
  } catch (error) {
    console.error("Failed to fetch polls:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new poll
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId }  = await params;
        const { question, options, endDate } = await request.json();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || !['chairperson', 'secretary'].includes(membership.role)) {
            return NextResponse.json({ error: "You do not have permission to create polls." }, { status: 403 });
        }

        if (!question || !Array.isArray(options) || options.length < 2 || !endDate) {
            return NextResponse.json({ error: "Question, at least two options, and an end date are required." }, { status: 400 });
        }

        const pollOptions = options.map(opt => ({ text: opt.text, votes: 0 }));

        const newPoll = await Poll.create({
            chamaId,
            createdBy: user.id,
            question,
            options: pollOptions,
            endDate,
        });

        return NextResponse.json({ message: "Poll created successfully", poll: newPoll }, { status: 201 });

    } catch (error) {
        console.error("Failed to create poll:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
