import { connectDB } from "@/lib/dbConnect";
import Contribution from "@/models/Contribution";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    await connectDB();

    // Get token from auth-token cookie and verify it
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    
    if (!token) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    const userId = decoded.userId;
    const contributions = await Contribution.find({ userId }).sort({ createdAt: -1 });

    return new Response(JSON.stringify({ contributions }), { status: 200 });
  } catch (error) {
    console.error("Get contributions error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch contributions" }), { status: 500 });
  }
}