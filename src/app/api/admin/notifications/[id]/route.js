// src/app/api/admin/notifications/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import ContactMessage from '@/models/ContactMessage';

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    await ContactMessage.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Notification deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting notification' }, { status: 500 });
  }
}