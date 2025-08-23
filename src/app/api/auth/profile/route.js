import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { cookies } from "next/headers";

export async function GET() {
  await connectDB();

  const userCookie =  await cookies().get("user");
  if (!userCookie) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  const userData = JSON.parse(userCookie.value);

  const user = await User.findById(userData.id).select("-password");
  console.log(firstname, lastName, email, phoneNumber, role);
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ user }), { status: 200 });
}
