import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Chama from "@/models/Chama";
import { getServerSideUser } from '@/lib/auth';

const isSystemAdmin = (user) => {
    return user && user.role === 'admin';
}

export async function PUT(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user || !isSystemAdmin(user)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = params;
        const { action } = await request.json(); // action will be 'approve' or 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
        
        const newStatus = action === 'approve' ? 'active' : 'rejected';

        const updatedChama = await Chama.findByIdAndUpdate(
            id,
            { 
                status: newStatus,
                approvedBy: user.id,
                approvedAt: new Date()
            },
            { new: true }
        );

        if (!updatedChama) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // TODO: Send an email notification to the Chama creator about the status change.

        return NextResponse.json({
            message: `Chama has been ${newStatus}.`,
            chama: updatedChama
        });

    } catch (error) {
        console.error("Failed to update application:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}   