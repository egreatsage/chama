import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Chama from "@/models/Chama";
import User from '@/models/User'; // Make sure User model is imported
import { getServerSideUser } from '@/lib/auth';
// Import the new email functions
import { sendChamaApprovalEmail, sendChamaRejectionEmail } from '@/lib/email';

const isSystemAdmin = (user) => user && user.role === 'admin';

export async function PUT(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user || !isSystemAdmin(user)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = await params;
        const { action } = await request.json();

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
        ).populate({ path: 'createdBy', select: 'email', model: User }); // Populate creator's email

        if (!updatedChama) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // --- SEND NOTIFICATION EMAIL ---
        try {
            const creatorEmail = updatedChama.createdBy.email;
            if (action === 'approve') {
                await sendChamaApprovalEmail({ to: creatorEmail, chamaName: updatedChama.name });
            } else {
                await sendChamaRejectionEmail({ to: creatorEmail, chamaName: updatedChama.name });
            }
        } catch (emailError) {
            console.error("Failed to send notification email, but the action was successful.", emailError);
            // Don't fail the request if the email fails. Just log the error.
        }
        // -----------------------------

        return NextResponse.json({
            message: `Chama has been ${newStatus}.`,
            chama: updatedChama
        });

    } catch (error) {
        console.error("Failed to update application:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}