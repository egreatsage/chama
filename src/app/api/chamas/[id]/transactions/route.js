import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import FinancialTransaction from "@/models/FinancialTransaction";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import User from '@/models/User';

const canManageFinances = (role) => ['chairperson', 'treasurer'].includes(role);

// GET: Fetch all financial transactions for a Chama
export async function GET(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = await params;

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Authorization: User must be a member to view transactions
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership) {
            return NextResponse.json({ error: "Access Forbidden." }, { status: 403 });
        }

        const transactions = await FinancialTransaction.find({ chamaId })
            .populate({
                path: 'recordedBy',
                select: 'firstName lastName',
                model: User
            })
            .sort({ createdAt: 'desc' });

        return NextResponse.json({ transactions });

    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Record a new income or expense transaction
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId } = params;
        const { type, category, amount, description, investmentId } = await request.json();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Authorization: Only chairperson or treasurer can record transactions
        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || !canManageFinances(membership.role)) {
            return NextResponse.json({ error: "You do not have permission to record transactions." }, { status: 403 });
        }

        // Validation
        if (!type || !['income', 'expense'].includes(type) || !category || !amount || amount <= 0) {
            return NextResponse.json({ error: "Type, category, and a valid amount are required." }, { status: 400 });
        }

        // 1. Create the FinancialTransaction record
        const newTransaction = await FinancialTransaction.create({
            chamaId,
            investmentId: investmentId || null,
            type,
            category,
            amount,
            description,
            recordedBy: user.id,
        });
        
        // 2. Determine the amount to adjust the balance by
        const amountToUpdate = type === 'income' ? amount : -amount;

        // 3. Atomically update the Chama's currentBalance
        await Chama.findByIdAndUpdate(chamaId, {
            $inc: { currentBalance: amountToUpdate }
        });

        const populatedTransaction = await FinancialTransaction.findById(newTransaction._id)
            .populate({
                path: 'recordedBy',
                select: 'firstName lastName',
                model: User
            });

        return NextResponse.json({ 
            message: 'Transaction recorded successfully.', 
            transaction: populatedTransaction 
        }, { status: 201 });

    } catch (error) {
        console.error("Failed to record transaction:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
