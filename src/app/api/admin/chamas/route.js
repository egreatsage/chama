import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import Chama from "@/models/Chama";
import User from '@/models/User';
import { getServerSideUser } from '@/lib/auth';

const isSystemAdmin = (user) => user && user.role === 'admin';

export async function GET() {
    await connectDB();
    try {
        const user = await getServerSideUser();
        if (!user || !isSystemAdmin(user)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const chamas = await Chama.find({})
            .populate({
                path: 'createdBy',
                select: 'firstName lastName email phoneNumber',
                model: User
            })
            .sort({ createdAt: -1 });
        return NextResponse.json({ chamas });

    } catch (error) {
        console.error("Failed to fetch chamas:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}