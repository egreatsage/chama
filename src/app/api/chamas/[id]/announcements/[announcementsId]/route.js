// File Path: src/app/api/chamas/[id]/announcements/[announcementId]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Announcement from "@/models/Announcement";
import ChamaMember from "@/models/ChamaMember";
import User from '@/models/User';

const canManageAnnouncements = (role) => ['chairperson', 'secretary'].includes(role);

// PUT: Update an announcement
export async function PUT(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId, announcementId }  = await params;
        const { title, content, isPinned } = await request.json();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || !canManageAnnouncements(membership.role)) {
            return NextResponse.json({ error: "Permission denied." }, { status: 403 });
        }

        const announcement = await Announcement.findById(announcementId);
        if (!announcement || announcement.chamaId.toString() !== chamaId) {
            return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
        }
        
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            announcementId,
            { title, content, isPinned },
            { new: true, runValidators: true }
        ).populate({
            path: 'createdBy',
            select: 'firstName lastName photoUrl',
            model: User
        });
        
        return NextResponse.json({
            message: 'Announcement updated successfully.',
            announcement: updatedAnnouncement
        });

    } catch (error) {
        console.error("Failed to update announcement:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


// DELETE: Delete an announcement
export async function DELETE(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId, announcementId }  = await params;

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || !canManageAnnouncements(membership.role)) {
            return NextResponse.json({ error: "Permission denied." }, { status: 403 });
        }
        
        const deletedAnnouncement = await Announcement.findOneAndDelete({
            _id: announcementId,
            chamaId: chamaId
        });

        if (!deletedAnnouncement) {
            return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Announcement deleted successfully." });

    } catch (error) {
        console.error("Failed to delete announcement:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
