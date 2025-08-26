import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember"; // Import ChamaMember to delete members
import { getServerSideUser } from '@/lib/auth';

const isSystemAdmin = (user) => user && user.role === 'admin';

// PUT: Update a Chama's details
export async function PUT(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user || !isSystemAdmin(user)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = params;
        const updateData = await request.json();

        const updatedChama = await Chama.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedChama) {
            return NextResponse.json({ error: "Chama not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Chama updated successfully.", chama: updatedChama });

    } catch (error) {
        console.error("Failed to update Chama:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Delete a Chama and all its members
export async function DELETE(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user || !isSystemAdmin(user)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = params;
        
        // First, delete all members associated with the Chama
        await ChamaMember.deleteMany({ chamaId: id });

        // Then, delete the Chama itself
        const deletedChama = await Chama.findByIdAndDelete(id);

        if (!deletedChama) {
            return NextResponse.json({ error: "Chama not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Chama and all its members have been deleted." });

    } catch (error) {
        console.error("Failed to delete Chama:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}