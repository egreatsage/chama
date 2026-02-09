import ChamaMember from "@/models/ChamaMember";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function checkChamaRole(chamaId, requiredRoles = []) {
  const session = await getServerSession(authOptions);
  if (!session) return { authorized: false, error: "Not logged in" };

  const memberRecord = await ChamaMember.findOne({
    chamaId: chamaId,
    userId: session.user.id,
    status: 'active'
  });

  if (!memberRecord) return { authorized: false, error: "Not a member" };

  // If no specific roles required, just being a member is enough
  if (requiredRoles.length === 0) return { authorized: true, role: memberRecord.role };

  if (!requiredRoles.includes(memberRecord.role)) {
    return { authorized: false, error: "Insufficient permissions" };
  }

  return { authorized: true, role: memberRecord.role, memberId: memberRecord._id };
}