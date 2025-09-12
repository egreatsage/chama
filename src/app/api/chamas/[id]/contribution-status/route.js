// File Path: src/app/api/chamas/[id]/contribution-status/route.js

import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import Contribution from "@/models/Contribution";
import User from '@/models/User';

// Helper to get the current contribution period
const getCurrentPeriod = (frequency) => {
    const now = new Date();
    let start, end;
    
    try {
        switch (frequency?.toLowerCase()) {
            case 'weekly':
                const dayOfWeek = now.getDay();
                start = new Date(now);
                start.setDate(now.getDate() - dayOfWeek);
                start.setHours(0, 0, 0, 0);
                
                end = new Date(start);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
                
            case 'quarterly':
                const quarter = Math.floor(now.getMonth() / 3);
                start = new Date(now.getFullYear(), quarter * 3, 1);
                start.setHours(0, 0, 0, 0);
                
                end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
                end.setHours(23, 59, 59, 999);
                break;
                
            case 'yearly':
                start = new Date(now.getFullYear(), 0, 1);
                start.setHours(0, 0, 0, 0);
                
                end = new Date(now.getFullYear(), 11, 31);
                end.setHours(23, 59, 59, 999);
                break;
                
            default: // monthly
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                start.setHours(0, 0, 0, 0);
                
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
                break;
        }
    } catch (error) {
        console.error('Error calculating period:', error);
        // Fallback to current month
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
    }
    
    return { start, end };
};

export async function GET(request, { params }) {
    try {
        await connectDB();
        
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" }, 
                { status: 401 }
            );
        }

        const { id: chamaId } =await params;
        if (!chamaId || typeof chamaId !== 'string') {
            return NextResponse.json(
                { error: "Invalid chama ID" }, 
                { status: 400 }
            );
        }

        const membership = await ChamaMember.findOne({ 
            userId: user.id, 
            chamaId,
            status: { $in: ['active', 'pending'] }
        });
        
        if (!membership) {
            return NextResponse.json(
                { error: "You don't have access to this chama" }, 
                { status: 403 }
            );
        }

        // Get chama details - **MODIFIED TO INCLUDE equalSharing**
        const chama = await Chama.findById(chamaId).select(
            'contributionAmount contributionFrequency name equalSharing'
        );
        
        if (!chama) {
            return NextResponse.json(
                { error: "Chama not found" }, 
                { status: 404 }
            );
        }

        if (!chama.contributionAmount || chama.contributionAmount <= 0) {
            return NextResponse.json(
                { error: "Chama contribution amount not set" }, 
                { status: 400 }
            );
        }

        const { start, end } = getCurrentPeriod(chama.contributionFrequency);
        
        const members = await ChamaMember.find({ 
            chamaId, 
            status: 'active' 
        })
        .populate({
            path: 'userId',
            select: 'firstName lastName photoUrl',
            model: User
        })
        .lean();
        
        if (!members.length) {
            return NextResponse.json({
                memberStatuses: [],
                period: { 
                    start: start.toISOString(), 
                    end: end.toISOString(),
                    frequency: chama.contributionFrequency || 'monthly'
                },
                stats: {
                    totalMembers: 0,
                    paidMembers: 0,
                    unpaidMembers: 0,
                    totalCollected: 0,
                    expectedTotal: 0
                }
            });
        }

        const contributionsInPeriod = await Contribution.find({
            chamaId,
            status: 'confirmed',
            createdAt: { $gte: start, $lte: end }
        })
        .sort({ createdAt: -1 })
        .lean();

        const contributionsMap = new Map();
        contributionsInPeriod.forEach(contribution => {
            const userId = contribution.userId.toString();
            if (!contributionsMap.has(userId)) {
                contributionsMap.set(userId, { total: 0, payments: [] });
            }
            const memberData = contributionsMap.get(userId);
            memberData.total += Number(contribution.amount || 0);
            memberData.payments.push({
                method: contribution.paymentMethod,
                date: contribution.createdAt,
                amount: contribution.amount
            });
        });

        const memberStatuses = members
            .filter(member => member.userId)
            .map(member => {
                const memberId = member.userId._id.toString();
                const contributionData = contributionsMap.get(memberId);
                const paidAmount = contributionData?.total || 0;
                const expectedAmount = Number(chama.contributionAmount);

                let status = 'Unpaid';
                if (paidAmount >= expectedAmount) {
                    status = 'Paid';
                } else if (paidAmount > 0) {
                    status = 'Partially Paid';
                }
                
                const sortedPayments = contributionData?.payments?.sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                ) || [];
                
                return {
                    memberInfo: member.userId,
                    status,
                    paidAmount: Number(paidAmount.toFixed(2)),
                    expectedAmount: Number(expectedAmount.toFixed(2)),
                    lastPayment: sortedPayments.length > 0 ? sortedPayments[0] : null
                };
            })
            .sort((a, b) => {
                const statusOrder = { 'Unpaid': 0, 'Partially Paid': 1, 'Paid': 2 };
                const statusDiff = statusOrder[a.status] - statusOrder[b.status];
                
                if (statusDiff !== 0) return statusDiff;
                
                const nameA = `${a.memberInfo.firstName} ${a.memberInfo.lastName}`;
                const nameB = `${b.memberInfo.firstName} ${b.memberInfo.lastName}`;
                return nameA.localeCompare(nameB);
            });

        const stats = {
            totalMembers: memberStatuses.length,
            paidMembers: memberStatuses.filter(m => m.status === 'Paid').length,
            partiallyPaidMembers: memberStatuses.filter(m => m.status === 'Partially Paid').length,
            unpaidMembers: memberStatuses.filter(m => m.status === 'Unpaid').length,
            totalCollected: Number(memberStatuses.reduce((sum, m) => sum + m.paidAmount, 0).toFixed(2)),
            expectedTotal: Number(memberStatuses.reduce((sum, m) => sum + m.expectedAmount, 0).toFixed(2)),
            collectionRate: 0
        };

        if (stats.expectedTotal > 0) {
            stats.collectionRate = Number(((stats.totalCollected / stats.expectedTotal) * 100).toFixed(1));
        }

        const response = {
            memberStatuses,
            period: { 
                start: start.toISOString(), 
                end: end.toISOString(),
                frequency: chama.contributionFrequency || 'monthly'
            },
            stats,
            chamaInfo: {
                name: chama.name,
                contributionAmount: Number(chama.contributionAmount.toFixed(2)),
                contributionFrequency: chama.contributionFrequency,
                equalSharing: chama.equalSharing // **ADDED THIS LINE**
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("Failed to fetch contribution status:", error);
        
        const isDevelopment = process.env.NODE_ENV === 'development';
        const errorMessage = isDevelopment ? error.message : "Internal server error";
        
        return NextResponse.json(
            { 
                error: errorMessage,
                ...(isDevelopment && { stack: error.stack })
            }, 
            { status: 500 }
        );
    }
}