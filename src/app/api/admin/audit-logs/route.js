// File Path: src/app/api/admin/audit-logs/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import AuditLog from "@/models/AuditLog";
import User from '@/models/User';
import Chama from '@/models/Chama';
import { getServerSideUser } from '@/lib/auth';

// Helper to check for admin/treasurer roles
const hasElevatedPrivileges = (user) => {
  return user && ['admin','chairperson', 'treasurer'].includes(user.role);
};

// GET: Fetch all audit logs for display in the admin panel
export async function GET() {
  await connectDB();
  try {
    const user = await getServerSideUser();
    // Authorization check
    if (!user || !hasElevatedPrivileges(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all logs, populating related user and chama names for display
    const auditLogs = await AuditLog.find({})
      .populate({
          path: 'userId', // The user who was the subject of the action
          select: 'firstName lastName',
          model: User
      })
      .populate({
          path: 'adminId', // The admin who performed the action
          select: 'firstName lastName',
          model: User
      })
      .populate({
          path: 'chamaId', // The chama where the action took place
          select: 'name',
          model: Chama
      })
      .sort({ createdAt: -1 }); // Show the most recent events first

    return NextResponse.json({ auditLogs });

  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}

