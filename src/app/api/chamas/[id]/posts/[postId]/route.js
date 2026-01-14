// src/app/api/chamas/[id]/posts/[postId]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Post from "@/models/Post";
import ChamaMember from "@/models/ChamaMember";

const canManagePosts = (role) => ['chairperson', 'secretary'].includes(role);

export async function GET(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId, postId }  = await params;

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership) {
            return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
        }

        const post = await Post.findOne({ _id: postId, chamaId })
            .populate({
                path: 'authorId',
                select: 'firstName lastName photoUrl',
                model: User
            });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ post });

    } catch (error) {
        console.error("Failed to fetch post:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function PUT(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId, postId }  = await params;
        const { title, content, category, imageUrl } = await request.json();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || !canManagePosts(membership.role)) {
            return NextResponse.json({ error: "Permission denied." }, { status: 403 });
        }

        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId, chamaId },
            { title, content, category, imageUrl },
            { new: true, runValidators: true }
        ).populate('authorId', 'firstName lastName photoUrl');

        if (!updatedPost) {
            return NextResponse.json({ error: "Post not found." }, { status: 404 });
        }

        return NextResponse.json({ message: 'Post updated successfully.', post: updatedPost });

    } catch (error) {
        console.error("Failed to update post:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Delete a post
export async function DELETE(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId, postId }  = await params;

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || !canManagePosts(membership.role)) {
            return NextResponse.json({ error: "Permission denied." }, { status: 403 });
        }

        const deletedPost = await Post.findOneAndDelete({ _id: postId, chamaId });

        if (!deletedPost) {
            return NextResponse.json({ error: "Post not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Post deleted successfully." });

    } catch (error) {
        console.error("Failed to delete post:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

