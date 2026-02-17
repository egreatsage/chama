// src/app/api/contact/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConnect';
import ContactMessage from '@/models/ContactMessage';
import { sendContactMessageEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // 1. Store in Database
    const newMessage = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message
    });

    // 2. Send Email
    await sendContactMessageEmail({ name, email, phone, subject, message });

    return NextResponse.json(
      { message: 'Message sent successfully', data: newMessage }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}