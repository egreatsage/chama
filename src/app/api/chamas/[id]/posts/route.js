// src/app/api/chamas/[id]/posts/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Post from "@/models/Post";
import ChamaMember from "@/models/ChamaMember";
import User from '@/models/User';

// GET: Fetch all posts for a Chama
export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId }  = await params;

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
    }

    const posts = await Post.find({ chamaId })
      .populate({
        path: 'authorId',
        select: 'firstName lastName photoUrl',
        model: User
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId }  = await params;
        const { title, content, category, imageUrl } = await request.json();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

       

        if (!title || !content || !category) {
            return NextResponse.json({ error: "Title, content, and category are required." }, { status: 400 });
        }

        const newPost = await Post.create({
            chamaId,
            authorId: user.id,
            title,
            content,
            category,
            imageUrl,
        });

        const populatedPost = await Post.findById(newPost._id).populate({
            path: 'authorId',
            select: 'firstName lastName photoUrl',
            model: User
        });

        return NextResponse.json({ message: "Post created successfully", post: populatedPost }, { status: 201 });

    } catch (error) {
        console.error("Failed to create post:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
