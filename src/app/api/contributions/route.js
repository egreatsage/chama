import { connectDB } from "@/lib/dbConnect";
import Contribution from "@/models/Contribution";
import { cookies } from "next/headers";

export async function GET() {
  await connectDB();

  const userCookie = await cookies().get("user");
  if (!userCookie) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }
  const user = JSON.parse(userCookie.value);

  const contributions = await Contribution.find({ userId: user.id }).sort({ createdAt: -1 });

  return new Response(JSON.stringify({ contributions }), { status: 200 });
}
