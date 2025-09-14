// File Path: src/app/api/chamas/[id]/contribution-status/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import Contribution from "@/models/Contribution";
import User from '@/models/User';

/**
 * Calculates the total number of contribution periods between a start and end date.
 * @param {Date} start - The start date of the savings period.
 * @param {Date} end - The end date of the savings period.
 * @param {string} frequency - The contribution frequency ('daily', 'weekly', 'monthly', 'quarterly').
 * @returns {number} The total number of periods.
 */
const calculatePeriods = (start, end, frequency) => {
    if (!start || !end) return 1;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate <= startDate) return 1;

    let months;
    switch (frequency) {
        case 'monthly':
            months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
            months -= startDate.getMonth();
            months += endDate.getMonth();
            return months <= 0 ? 1 : months + 1;
        case 'weekly':
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return Math.ceil(diffDays / 7) || 1;
        case 'daily':
            const timeDiff = Math.abs(endDate - startDate);
            return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) || 1;
        case 'quarterly':
            months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
            months -= startDate.getMonth();
            months += endDate.getMonth();
            return Math.ceil((months + 1) / 3) || 1;
        default:
            return 1;
    }
};

/**
 * Determines the start and end dates of the current contribution period based on frequency.
 * @param {string} frequency - The contribution frequency.
 * @returns {{start: Date, end: Date}} The start and end dates of the current period.
 */
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
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
    }
    
    return { start, end };
};

export async function GET(request, { params }) {
    try {
        // --- 1. SETUP AND AUTHENTICATION ---
        await connectDB();
        const user = await getServerSideUser();
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { id: chamaId } = await params;
        if (!chamaId || typeof chamaId !== 'string') {
            return NextResponse.json({ error: "Invalid chama ID" }, { status: 400 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership) {
            return NextResponse.json({ error: "You don't have access to this chama" }, { status: 403 });
        }

        // --- 2. FETCH CHAMA AND MEMBER DATA ---
        const chama = await Chama.findById(chamaId).select('name operationType contributionFrequency equalSharing rotationPayout cycleCount');
        if (!chama) {
            return NextResponse.json({ error: "Chama not found" }, { status: 404 });
        }

        const members = await ChamaMember.find({ chamaId, status: 'active' })
            .populate({ path: 'userId', select: 'firstName lastName photoUrl', model: User })
            .lean();
        
        const memberCount = members.length;
        if (memberCount === 0) {
            return NextResponse.json({ error: "No active members in this chama" }, { status: 404 });
        }

        // --- 3. CALCULATE EXPECTED CONTRIBUTION AMOUNT FOR THE CURRENT PERIOD ---
        let expectedAmountForPeriod = 0;
        if (chama.operationType === 'rotation_payout') {
            // For rotation, each member contributes their share of the total pot for one person.
            const totalPot = chama.rotationPayout.targetAmount || 0;
            expectedAmountForPeriod = totalPot / memberCount;
        } else if (chama.operationType === 'equal_sharing') {
            // For equal sharing, we divide the total goal by the number of contribution periods.
            const totalTarget = chama.equalSharing.currentCycle.targetAmount || 0;
            const totalContributionPeriods = calculatePeriods(
                chama.equalSharing.currentCycle.startDate, 
                chama.equalSharing.currentCycle.endDate, 
                chama.contributionFrequency
            );
            
            if (memberCount > 0 && totalContributionPeriods > 0) {
                // Total amount each member needs to contribute over the entire savings duration
                const totalContributionPerMember = totalTarget / memberCount;
                // Amount per member for each contribution period
                expectedAmountForPeriod = totalContributionPerMember / totalContributionPeriods;
            }
        }

        // --- 4. FETCH CONTRIBUTIONS FOR THE CURRENT PERIOD ---
        const { start, end } = getCurrentPeriod(chama.contributionFrequency);
        const contributionsInPeriod = await Contribution.find({
            chamaId,
            status: 'confirmed',
            cycle: chama.cycleCount,
            createdAt: { $gte: start, $lte: end }
        }).lean();

        // --- 5. PROCESS AND MAP CONTRIBUTIONS TO MEMBERS ---
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

        // --- 6. DETERMINE THE STATUS OF EACH MEMBER FOR THE PERIOD ---
        const memberStatuses = members
            .filter(member => member.userId) // Ensure member has a user attached
            .map(member => {
                const memberId = member.userId._id.toString();
                const contributionData = contributionsMap.get(memberId);
                const paidAmount = contributionData?.total || 0;

                let status = 'Unpaid';
                if (paidAmount >= expectedAmountForPeriod) {
                    status = 'Paid';
                } else if (paidAmount > 0) {
                    status = 'Partially Paid';
                }
                
                const sortedPayments = contributionData?.payments?.sort((a, b) => new Date(b.date) - new Date(a.date)) || [];
                
                return {
                    memberInfo: member.userId,
                    status,
                    paidAmount: parseFloat(paidAmount.toFixed(2)),
                    expectedAmount: parseFloat(expectedAmountForPeriod.toFixed(2)),
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

        // --- 7. CALCULATE SUMMARY STATISTICS ---
        const totalCollectedInPeriod = memberStatuses.reduce((sum, m) => sum + m.paidAmount, 0);
        const expectedTotalForPeriod = memberStatuses.reduce((sum, m) => sum + m.expectedAmount, 0);
        const collectionRate = expectedTotalForPeriod > 0 ? (totalCollectedInPeriod / expectedTotalForPeriod) * 100 : 0;
        
        const stats = {
            totalMembers: memberStatuses.length,
            paidMembers: memberStatuses.filter(m => m.status === 'Paid').length,
            partiallyPaidMembers: memberStatuses.filter(m => m.status === 'Partially Paid').length,
            unpaidMembers: memberStatuses.filter(m => m.status === 'Unpaid').length,
            totalCollected: parseFloat(totalCollectedInPeriod.toFixed(2)),
            expectedTotal: parseFloat(expectedTotalForPeriod.toFixed(2)),
            collectionRate: parseFloat(collectionRate.toFixed(1))
        };

        // --- 8. CONSTRUCT AND SEND THE RESPONSE ---
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
                contributionAmount: parseFloat(expectedAmountForPeriod.toFixed(2)), // This is the periodic amount
                contributionFrequency: chama.contributionFrequency,
                equalSharing: chama.equalSharing,
                rotationPayout: chama.rotationPayout
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error("Failed to fetch contribution status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}