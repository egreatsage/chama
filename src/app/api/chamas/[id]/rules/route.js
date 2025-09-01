// File Path: src/app/api/chamas/[id]/rules/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import ChamaRules from "@/models/ChamaRules";
import ChamaMember from "@/models/ChamaMember";

// GET: Fetch the rules for a specific Chama
export async function GET(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = await params; // Fixed: Added await for params

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate chamaId format
    if (!chamaId || typeof chamaId !== 'string') {
      return NextResponse.json({ error: "Invalid chama ID" }, { status: 400 });
    }

    // Authorization: User must be a member to view rules
    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership) {
      return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
    }

    // Find rules, or create a default set if none exist
    let rules = await ChamaRules.findOne({ chamaId });
    if (!rules) {
      // Create default rules with proper structure
      rules = await ChamaRules.create({ 
        chamaId,
        latePenalty: {
          enabled: false,
          amount: 0,
          gracePeriodDays: 0
        },
        meetingAttendance: {
          required: false,
          penaltyAmount: 0
        }
      });
    }

    return NextResponse.json({ rules });

  } catch (error) {
    console.error("Failed to fetch chama rules:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update the rules for a specific Chama
export async function PUT(request, { params }) {
  await connectDB();
  try {
    const user = await getServerSideUser();
    const { id: chamaId } = await params; // Fixed: Added await for params consistency
    const body = await request.json();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate chamaId format
    if (!chamaId || typeof chamaId !== 'string') {
      return NextResponse.json({ error: "Invalid chama ID" }, { status: 400 });
    }

    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Authorization: Only chairperson can update rules
    const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
    if (!membership || membership.role !== 'chairperson') {
      return NextResponse.json({ error: "Only the chairperson can update rules." }, { status: 403 });
    }

    // Sanitize and validate the input data
    const sanitizedRules = {
      chamaId, // Ensure chamaId is always set
      latePenalty: {
        enabled: Boolean(body.latePenalty?.enabled),
        amount: Math.max(0, Number(body.latePenalty?.amount) || 0),
        gracePeriodDays: Math.max(0, Number(body.latePenalty?.gracePeriodDays) || 0)
      },
      meetingAttendance: {
        required: Boolean(body.meetingAttendance?.required),
        penaltyAmount: Math.max(0, Number(body.meetingAttendance?.penaltyAmount) || 0)
      },
      customRules: Array.isArray(body.customRules) ? body.customRules.filter(rule => typeof rule === 'string' && rule.trim()) : []
    };

    // Additional validation
    if (sanitizedRules.latePenalty.amount > 10000) {
      return NextResponse.json({ error: "Late penalty amount cannot exceed KES 10,000" }, { status: 400 });
    }

    if (sanitizedRules.latePenalty.gracePeriodDays > 30) {
      return NextResponse.json({ error: "Grace period cannot exceed 30 days" }, { status: 400 });
    }

    if (sanitizedRules.meetingAttendance.penaltyAmount > 5000) {
      return NextResponse.json({ error: "Meeting penalty amount cannot exceed KES 5,000" }, { status: 400 });
    }

    const updatedRules = await ChamaRules.findOneAndUpdate(
      { chamaId },
      { $set: sanitizedRules },
      { 
        new: true, 
        upsert: true, 
        runValidators: true,
        setDefaultsOnInsert: true // Ensure defaults are set when creating new document
      }
    );

    return NextResponse.json({ 
      message: "Rules updated successfully.", 
      rules: updatedRules 
    });

  } catch (error) {
    console.error("Failed to update chama rules:", error);
    
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validationErrors 
      }, { status: 400 });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({ error: "Rules already exist for this chama" }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}