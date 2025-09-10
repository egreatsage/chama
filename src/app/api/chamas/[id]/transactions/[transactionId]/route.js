// File Path: src/app/api/chamas/[id]/transactions/[transactionId]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import FinancialTransaction from "@/models/FinancialTransaction";
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import User from '@/models/User';
import mongoose from 'mongoose';

const canManageFinances = (role) => ['chairperson', 'treasurer'].includes(role);

// PUT: Update a specific financial transaction
export async function PUT(request, { params }) {
    await connectDB();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await getServerSideUser();
        const { id: chamaId, transactionId } = params;
        const { amount, category, description } = await request.json();

        if (!user) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId }).session(session);
        if (!membership || !canManageFinances(membership.role)) {
            await session.abortTransaction();
            return NextResponse.json({ error: "You do not have permission to edit transactions." }, { status: 403 });
        }

        const originalTransaction = await FinancialTransaction.findById(transactionId).session(session);
        if (!originalTransaction) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Calculate the difference to update the chama balance correctly
        const amountDifference = (amount || originalTransaction.amount) - originalTransaction.amount;
        const balanceUpdate = originalTransaction.type === 'income' ? amountDifference : -amountDifference;

        // Update Chama balance
        await Chama.findByIdAndUpdate(chamaId, {
            $inc: { currentBalance: balanceUpdate }
        }, { session });

        // Update the transaction
        const updatedTransaction = await FinancialTransaction.findByIdAndUpdate(
            transactionId,
            { amount, category, description },
            { new: true, runValidators: true, session }
        ).populate({
            path: 'recordedBy',
            select: 'firstName lastName',
            model: User
        });

        await session.commitTransaction();
        return NextResponse.json({ message: 'Transaction updated successfully.', transaction: updatedTransaction });

    } catch (error) {
        await session.abortTransaction();
        console.error("Failed to update transaction:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        session.endSession();
    }
}


// DELETE: Delete a specific financial transaction
export async function DELETE(request, { params }) {
    await connectDB();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await getServerSideUser();
        const { id: chamaId, transactionId } = params;

        if (!user) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId }).session(session);
        if (!membership || !canManageFinances(membership.role)) {
            await session.abortTransaction();
            return NextResponse.json({ error: "You do not have permission to delete transactions." }, { status: 403 });
        }

        // Find the transaction to be deleted
        const transactionToDelete = await FinancialTransaction.findById(transactionId).session(session);
        if (!transactionToDelete) {
            await session.abortTransaction();
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        // Reverse the financial impact on the Chama's balance
        const amountToReverse = transactionToDelete.type === 'income' 
            ? -transactionToDelete.amount 
            : transactionToDelete.amount;

        await Chama.findByIdAndUpdate(chamaId, {
            $inc: { currentBalance: amountToReverse }
        }, { session });

        // Delete the transaction record
        await FinancialTransaction.findByIdAndDelete(transactionId, { session });

        await session.commitTransaction();
        return NextResponse.json({ message: "Transaction deleted successfully." });

    } catch (error) {
        await session.abortTransaction();
        console.error("Failed to delete transaction:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        session.endSession();
    }
}
