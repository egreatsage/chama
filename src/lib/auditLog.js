import AuditLog from '@/models/AuditLog';
import { connectDB } from '@/lib/dbConnect';

export async function logAuditEvent(details) {
  await connectDB();
  try {
    await AuditLog.create(details);
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}