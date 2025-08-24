import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Withdrawal from "@/models/Withdrawal";
import User from '@/models/User';
import { getServerSideUser } from '@/lib/auth';
import Contribution from '@/models/Contribution';

const hasElevatedPrivileges = (user) => {
  return user && ['admin', 'treasurer'].includes(user.role);
};


export async function DELETE(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user || !hasElevatedPrivileges(user)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { id } = params;
        const deletedContribution = await Contribution.findByIdAndDelete(id);

        if (!deletedContribution) {
            return NextResponse.json({ error: "contribution not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "contribution request deleted successfully." });

    } catch (error) {
        console.error("Failed to delete contribution:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}