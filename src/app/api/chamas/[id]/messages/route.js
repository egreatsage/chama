// File Path: src/app/api/chamas/[id]/messages/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Message from "@/models/Message";
import ChamaMember from "@/models/ChamaMember";
import User from '@/models/User';

// GET: Fetch all messages for a Chama
export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = params;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
    }

    const messages = await Message.find({ chamaId })
      .populate({
        path: 'userId',
        select: 'firstName lastName phoneNumber photoUrl',
        model: User
      })
      .sort({ createdAt: 'asc' }); // Fetch in chronological order

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Send a new message
export async function POST(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = params;
    const { text } = await request.json();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!text || text.trim() === '') {
        return NextResponse.json({ error: "Message text cannot be empty." }, { status: 400 });
    }

    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
    }

    const newMessage = await Message.create({
      chamaId,
      userId: user.id,
      text: text.trim(),
    });

    // Populate user details for the response
    const populatedMessage = await Message.findById(newMessage._id).populate({
        path: 'userId',
        select: 'firstName lastName phoneNumber photoUrl',
        model: User
    });

    return NextResponse.json({ message: populatedMessage }, { status: 201 });
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

