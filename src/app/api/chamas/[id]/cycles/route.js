// File Path: src/app/api/chamas/[id]/cycles/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import ChamaMember from "@/models/ChamaMember";
import ChamaCycle from "@/models/ChamaCycle";
import User from '@/models/User';

export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = await params;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Authorization: User must be a member to view history
    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
    }

    const cycles = await ChamaCycle.find({ chamaId })
      .populate({
        path: 'payouts.userId',
        select: 'firstName lastName photoUrl',
        model: User
      })
      // .populate({
      //   path:'beneficiaryId',
      //   select: 'firstName lastName photoUrl',
      //   model: User
      // })
      // .populate({
      //   path:'recipientId',
      //   select: 'firstName lastName photoUrl',
      //   model: User
      // })
      .sort({ createdAt: -1 });

    return NextResponse.json({ cycles });

  } catch (error) {
    console.error("Failed to fetch chama cycles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
