import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Chama from "@/models/Chama";
import User from '@/models/User'; // Needed for populating createdBy
import { getServerSideUser } from '@/lib/auth';

// NOTE: In a real system, you would have a separate 'system_admin' role.
// For now, we'll use the existing 'admin' role for this purpose.
const isSystemAdmin = (user) => {
    return user && user.role === 'admin';
}

export async function GET() {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user || !isSystemAdmin(user)) {
            return NextResponse.json({ error: "Unauthorized: Access is restricted to system administrators." }, { status: 403 });
        }

        const pendingChamas = await Chama.find({ status: 'pending' })
            .populate({
                path: 'createdBy',
                select: 'firstName lastName email',
                model: User
            })
            .sort({ createdAt: -1 });

        return NextResponse.json({ applications: pendingChamas });

    } catch (error) {
        console.error("Failed to fetch pending applications:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}