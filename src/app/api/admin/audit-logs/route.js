import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import AuditLog from "@/models/AuditLog";
import User from '@/models/User';
import Chama from '@/models/Chama';
import { getServerSideUser } from '@/lib/auth';

const hasElevatedPrivileges = (user) => {
  return user && ['admin', 'treasurer'].includes(user.role);
};

export async function GET() {
  await connectDB();
  try {
    const user = await getServerSideUser();
    if (!user || !hasElevatedPrivileges(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const auditLogs = await AuditLog.find({})
      .populate({
          path: 'userId',
          select: 'firstName lastName',
          model: User
      })
      .populate({
          path: 'adminId',
          select: 'firstName lastName',
          model: User
      })
      .populate({
          path: 'chamaId',
          select: 'name',
          model: Chama
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ auditLogs });

  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}