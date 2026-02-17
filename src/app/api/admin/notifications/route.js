// src/app/api/admin/notifications/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import ContactMessage from '@/models/ContactMessage';

// Simple check, real apps should verify Admin role via token here
export async function GET() {
  try {
    await connectDB();
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching notifications' }, { status: 500 });
  }
}