// File Path: src/app/api/chamas/[id]/announcements/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Announcement from "@/models/Announcement";
import ChamaMember from "@/models/ChamaMember";
import User from '@/models/User';
import Chama from '@/models/Chama';
import { sendNewAnnouncementEmail } from '@/lib/email';

// GET: Fetch all announcements for a Chama
export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = await params;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
    }

    const announcements = await Announcement.find({ chamaId })
      .populate({
        path: 'createdBy',
        select: 'firstName role lastName photoUrl',
        model: User
      })
      .sort({ isPinned: -1, createdAt: -1 }); // Pinned first, then newest

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new announcement
export async function POST(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = params;
    const { title, content, isPinned } = await request.json();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!title || !content) {
        return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership || !['chairperson', 'secretary'].includes(membership.role)) {
      return NextResponse.json({ error: "You do not have permission to create announcements." }, { status: 403 });
    }

    const newAnnouncement = await Announcement.create({
      chamaId,
      createdBy: user.id,
      title,
      content,
      isPinned: isPinned || false,
    });
    
    // Send email notifications to members
    try {
        const chama = await Chama.findById(chamaId);
        const members = await ChamaMember.find({ chamaId }).populate({
            path: 'userId',
            select: 'email',
            model: User
        });

        const recipients = members
            .map(m => m.userId?.email)
            .filter(email => email && email !== user.email); // Don't email the creator

        if (recipients.length > 0) {
            await sendNewAnnouncementEmail({
                recipients,
                chamaName: chama.name,
                announcementTitle: title,
                announcementContent: content,
                authorName: user.fullName
            });
        }
    } catch (emailError) {
        console.error("Announcement created, but failed to send email notifications:", emailError);
    }

    const populatedAnnouncement = await Announcement.findById(newAnnouncement._id).populate({
        path: 'createdBy',
        select: 'firstName lastName photoUrl',
        model: User
    });

    return NextResponse.json({ 
      message: 'Announcement posted successfully.', 
      announcement: populatedAnnouncement 
    }, { status: 201 });

  } catch (error) {
    console.error("Failed to create announcement:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
