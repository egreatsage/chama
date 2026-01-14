// File Path: src/models/Chama.js
import mongoose, { Schema, models } from "mongoose";

// --- Sub-schemas ---

// NEW: A sub-schema to hold details for the CURRENT active cycle
const EqualSharingCycleSchema = new Schema({
  targetAmount: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
}, { _id: false });

const EqualSharingSchema = new Schema({
  // The current cycle's configuration
  currentCycle: { type: EqualSharingCycleSchema, default: () => ({}) },
  automaticSharing: { type: Boolean, default: false },
}, { _id: false });

const RotationPayoutSchema = new Schema({
  targetAmount: { type: Number, default: 0 },
  rotationOrder: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  currentRecipientIndex: { type: Number, default: 0 },
  nextPayoutDate: { type: Date },
  payoutFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'monthly' },
  // startDate remains relevant for the overall start of the rotation
  savingStartDate: { type: Date, default: Date.now }, 
}, { _id: false });


// --- Main Chama Schema ---
const ChamaSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  operationType: {
    type: String,
    enum: ['equal_sharing', 'rotation_payout'],
    required: true,
  },
  contributionFrequency: { type: String, default: 'monthly' },
  currentBalance: { type: Number, default: 0 },
  totalContributions: { type: Number, default: 0 },
  // NEW: A counter for the number of completed cycles
  cycleCount: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'approved', 'active', 'suspended', 'closed'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },

  // --- Type-Specific Configurations ---
  equalSharing: { type: EqualSharingSchema, default: {} },
  rotationPayout: { type: RotationPayoutSchema, default: {} },

}, { timestamps: true });

// When creating a new Chama, transfer top-level config to the first cycle
ChamaSchema.pre('save', function(next) {
  if (this.isNew) {
    if (this.operationType === 'equal_sharing' && this.get('equalSharing.targetAmount')) {
      this.equalSharing.currentCycle = {
        targetAmount: this.get('equalSharing.targetAmount'),
        startDate: this.get('equalSharing.savingStartDate') || new Date(),
        endDate: this.get('equalSharing.savingEndDate')
      };
      // Clean up the old top-level fields
      this.set('equalSharing.targetAmount', undefined);
      this.set('equalSharing.savingStartDate', undefined);
      this.set('equalSharing.savingEndDate', undefined);
    }
  }
  next();
});


const Chama = models.Chama || mongoose.model("Chama", ChamaSchema);
export default Chama;
```eof
```javascript:New API for Starting a Cycle:src/app/api/chamas/[id]/new-cycle/route.js
// File Path: src/app/api/chamas/[id]/new-cycle/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/dbConnect";
import { getServerSideUser } from '@/lib/auth';
import Chama from "@/models/Chama";
import ChamaMember from "@/models/ChamaMember";
import { logAuditEvent } from '@/lib/auditLog';

// POST: Starts a new savings cycle for an Equal Sharing chama
export async function POST(request, { params }) {
    await connectDB();
    try {
        const user = await getServerSideUser();
        const { id: chamaId }  = await params;
        const { targetAmount, endDate } = await request.json();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const membership = await ChamaMember.findOne({ userId: user.id, chamaId });
        if (!membership || membership.role !== 'chairperson') {
            return NextResponse.json({ error: "Only the chairperson can start a new cycle." }, { status: 403 });
        }

        const chama = await Chama.findById(chamaId);
        if (!chama || chama.operationType !== 'equal_sharing') {
            return NextResponse.json({ error: "This action is only for Equal Sharing chamas." }, { status: 400 });
        }

        if (chama.currentBalance > 0) {
            return NextResponse.json({ error: "Cannot start a new cycle until the current balance is distributed." }, { status: 400 });
        }

        if (!targetAmount || !endDate) {
            return NextResponse.json({ error: "New target amount and end date are required." }, { status: 400 });
        }

        // Update the chama with the new cycle's information
        chama.equalSharing.currentCycle = {
            targetAmount: Number(targetAmount),
            startDate: new Date(),
            endDate: new Date(endDate),
        };
        chama.cycleCount += 1; // Increment the cycle counter

        await chama.save();
        
        // --- AUDIT LOGGING ---
        await logAuditEvent({
            chamaId,
            adminId: user.id,
            action: 'START_NEW_CYCLE',
            category: 'CHAMA_MANAGEMENT',
            description: `Started a new savings cycle (#${chama.cycleCount}) with a target of KES ${targetAmount}.`,
            after: chama.equalSharing.currentCycle
        });
        // --- END AUDIT LOGGING ---

        return NextResponse.json({ 
            message: `New savings cycle #${chama.cycleCount} has been started successfully!`,
            chama 
        });

    } catch (error) {
        console.error("Failed to start new cycle:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
```eof
```javascript:Equal Sharing Tab (Updated):src/components/chama/EqualSharingTab.js
// File Path: src/components/chama/EqualSharingTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TrendingUp, Calendar, Target, CheckCircle, Users, Clock, FileDown, PlusCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

// A helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);
};

// --- New Modal Component for Starting a New Cycle ---
const NewCycleModal = ({ isOpen, onClose, onSubmit }) => {
    const [targetAmount, setTargetAmount] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit({ targetAmount, endDate });
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Start New Savings Cycle</h3>
                            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Target Amount (KES)</label>
                                <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required min="1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New End Date</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300">{isSubmitting ? 'Starting...' : 'Start Cycle'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default function EqualSharingTab({ chama, userRole, onDataUpdate }) {
  const [cycles, setCycles] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  
  // Use the new currentCycle sub-document for active cycle data
  const { targetAmount = 0, endDate: savingEndDate } = chama.equalSharing?.currentCycle || {};
  const currentBalance = chama.currentBalance || 0;
  const isGoalReached = currentBalance > 0 && currentBalance >= targetAmount;
  // A cycle is complete if the balance is 0 AND there's a target (meaning a cycle was active)
  const isCycleComplete = currentBalance === 0 && targetAmount > 0;

  // ... (useEffect for fetchCycleHistory remains the same)
    useEffect(() => {
    const fetchCycleHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await fetch(`/api/chamas/${chama._id}/cycles`);
        if (!res.ok) throw new Error('Failed to load payout history');
        const data = await res.json();
        setCycles(data.cycles);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    if (chama._id) {
        fetchCycleHistory();
    }
  }, [chama._id, onDataUpdate]);

  const handleDistribute = async () => {
    // ... (handleDistribute logic remains the same)
    if (!window.confirm("Are you sure you want to distribute the funds? This will reset the current balance and start a new cycle.")) {
        return;
    }
    setIsDistributing(true);
    const toastId = toast.loading('Distributing funds...');
    try {
        const res = await fetch(`/api/chamas/${chama._id}/distribute`, { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success('Funds distributed successfully!', { id: toastId });
        onDataUpdate(); // This will re-trigger the useEffect to fetch new cycle data
    } catch (error) {
        toast.error(error.message, { id: toastId });
    } finally {
        setIsDistributing(false);
    }
  };

  const handleStartNewCycle = async (cycleData) => {
    const toastId = toast.loading('Starting new cycle...');
    try {
        const res = await fetch(`/api/chamas/${chama._id}/new-cycle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cycleData)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error);
        toast.success(data.message, { id: toastId });
        setIsNewCycleModalOpen(false);
        onDataUpdate(); // Refresh all chama data
    } catch (error) {
        toast.error(error.message, { id: toastId });
    }
  };
  
  // ... (generateHistoryExcel logic remains the same)
  const generateHistoryExcel = () => {
    if (!cycles || cycles.length === 0) {
        toast.error("No payout history to export.");
        return;
    }

    const excelData = [];
    cycles.forEach((cycle, index) => {
        excelData.push({
            'Type': `Cycle #${cycles.length - index} Summary`,
            'Date': new Date(cycle.endDate).toLocaleDateString(),
            'Recipient/Item': 'N/A',
            'Amount': cycle.totalCollected,
        });

        cycle.payouts.forEach(payout => {
            excelData.push({
                'Type': 'Payout',
                'Date': new Date(cycle.endDate).toLocaleDateString(),
                'Recipient/Item': payout.userId ? `${payout.userId.firstName} ${payout.userId.lastName}`: 'Unknown User',
                'Amount': payout.amount,
            });
        });

        excelData.push({});
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet['!cols'] = [
        { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payout History');

    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${chama.name}_equal_sharing_history_${currentDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };
  
  // --- Chart Data Preparation ---
  const progress = targetAmount > 0 ? (currentBalance / targetAmount) * 100 : 0;
  const progressChartData = [
    { name: 'Amount Saved', value: currentBalance },
    { name: 'Remaining', value: Math.max(0, targetAmount - currentBalance) },
  ];
  const COLORS = ['#10B981', '#E5E7EB'];

  // ... (historyChartData preparation remains the same)
    const historyChartData = cycles
    .map((cycle, index) => ({
      name: `Cycle ${cycles.length - index}`,
      'Total Distributed': cycle.totalCollected,
    }))
    .reverse();

  return (
    <div className="min-h-screen bg-gray-50 p-1 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Equal Sharing Overview - Cycle #{chama.cycleCount || 1}
          </h1>
          <p className="text-gray-600">Track your collective savings progress</p>
        </div>
        
        {/* Main Content Area: Conditional Rendering */}
        {isCycleComplete && userRole === 'chairperson' ? (
             <div className="bg-white shadow-xl rounded-2xl p-8 text-center border">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Cycle Complete!</h2>
                <p className="text-gray-600 mt-2 mb-6">The previous savings goal was met and funds were distributed. You can now start a new cycle.</p>
                <button onClick={() => setIsNewCycleModalOpen(true)} className="inline-flex items-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Start New Savings Cycle
                </button>
             </div>
        ) : isCycleComplete && userRole !== 'chairperson' ? (
             <div className="bg-white shadow-xl rounded-2xl p-8 text-center border">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Cycle Complete!</h2>
                <p className="text-gray-600 mt-2">Waiting for the chairperson to start the next savings cycle.</p>
             </div>
        ) : (
            // The existing view for an active cycle
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 sm:p-8 border border-white/20">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                 {/* ... existing chart and stats cards ... */}
                 <div className="lg:col-span-2">
                     <h2 className="text-2xl font-bold text-gray-800 mb-4">Savings Progress</h2>
                     <ResponsiveContainer width="100%" height={250}>
                         <PieChart>
                             <Pie data={progressChartData} cx="50%" cy="50%" labelLine={false} innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                 {progressChartData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
                             </Pie>
                             <Tooltip formatter={(value) => formatCurrency(value)} />
                             <Legend />
                             <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-800">{progress.toFixed(0)}%</text>
                         </PieChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="lg:col-span-3 space-y-6">
                    <div className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                        <p className="text-blue-100 text-sm font-medium mb-1">Target Amount</p>
                        <p className="text-3xl font-bold">{formatCurrency(targetAmount)}</p>
                    </div>
                    <div className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                        <p className="text-green-100 text-sm font-medium mb-1">Current Balance</p>
                        <p className="text-3xl font-bold">{formatCurrency(currentBalance)}</p>
                    </div>
                 </div>
              </div>
              {isGoalReached && (
                  <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500">
                      <h3 className="font-bold text-green-800">🎉 Goal Reached!</h3>
                      <p className="text-green-700">The chairperson can now distribute the funds.</p>
                  </div>
              )}
              {userRole === 'chairperson' && isGoalReached && (
                  <div className="mt-6 pt-6 border-t flex justify-end">
                      <button onClick={handleDistribute} disabled={isDistributing} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg">
                          {isDistributing ? 'Distributing...' : 'Distribute Funds'}
                      </button>
                  </div>
              )}
            </div>
        )}

        {/* Payout History Chart (remains the same) */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 sm:p-8 border border-white/20">
             {/* ... existing history chart and export button ... */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Payout History</h2>
                <button onClick={generateHistoryExcel} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md">
                    <FileDown className="h-4 w-4 mr-2" /> Export
                </button>
            </div>
            {isLoadingHistory ? <div className="text-center py-12">Loading history...</div> : cycles.length === 0 ? <div className="text-center py-12 text-gray-500">No payout cycles completed yet.</div> : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={historyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip formatter={(value) => formatCurrency(value)}/>
                        <Legend />
                        <Bar dataKey="Total Distributed" fill="#10B981" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>

      </div>
       <NewCycleModal isOpen={isNewCycleModalOpen} onClose={() => setIsNewCycleModalOpen(false)} onSubmit={handleStartNewCycle} />
    </div>
  );
}
```eof
```javascript:Rotation Tab (Updated):src/components/chama/RotationTab.js
// File Path: src/components/chama/RotationTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, RefreshCw, UserCheck, CheckCircle, XCircle, History, FileDown, Zap } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const formatCurrency = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

export default function RotationTab({ chama, members, userRole, onRotationUpdate }) {
    // ... (all existing state and handlers remain the same)
    const [isSaving, setIsSaving] = useState(false);
    const [contributionStatus, setContributionStatus] = useState(null);
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const memberMap = new Map(members.map(m => [m.userId._id.toString(), m.userId]));
    const rotationOrderIds = chama.rotationPayout?.rotationOrder || [];
    const [orderedMembers, setOrderedMembers] = useState(
        rotationOrderIds.map(userId => memberMap.get(userId.toString())).filter(Boolean)
    );

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [statusRes, historyRes] = await Promise.all([
                    fetch(`/api/chamas/${chama._id}/contribution-status`),
                    fetch(`/api/chamas/${chama._id}/cycles`)
                ]);

                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    setContributionStatus(statusData);
                } else {
                    toast.error("Could not load contribution status.");
                }

                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    setPayoutHistory(historyData.cycles?.filter(c => c.cycleType === 'rotation_cycle'));
                } else {
                    toast.error("Could not load payout history.");
                }
            } catch (error) {
                toast.error("Failed to load rotation data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [chama._id, onRotationUpdate]);
    
    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(orderedMembers);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setOrderedMembers(items);
    };

    const handleSaveChanges = async (randomize = false) => {
        setIsSaving(true);
        const toastId = toast.loading('Saving new order...');
        const memberUserIds = randomize ? members.map(m => m.userId._id) : orderedMembers.map(m => m.userId._id);

        try {
            const res = await fetch(`/api/chamas/${chama._id}/rotation`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rotationOrder: memberUserIds, randomize }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Rotation order saved!', { id: toastId });
            onRotationUpdate();
        } catch (err) {
            toast.error(err.message, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExecutePayout = async () => {
        if (!window.confirm("Are you sure? This will execute the payout and advance to the next member.")) return;
        setIsSaving(true);
        const toastId = toast.loading('Executing Payout...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}/rotation`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message, { id: toastId });
            onRotationUpdate();
        } catch (err) {
            toast.error(err.message, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };
    
    const currentIndex = chama.rotationPayout?.currentRecipientIndex || 0;
    const currentRecipient = orderedMembers[currentIndex];
    const allMembersPaid = contributionStatus?.stats?.unpaidMembers === 0 && contributionStatus?.stats?.partiallyPaidMembers === 0;
    const isNewRotation = currentIndex === 0 && payoutHistory.length >= members.length;


    // ... (chart data preparation remains the same)
    const contributionChartData = [
        { name: 'Paid', value: contributionStatus?.stats?.paidMembers || 0 },
        { name: 'Unpaid', value: (contributionStatus?.stats?.unpaidMembers || 0) + (contributionStatus?.stats?.partiallyPaidMembers || 0) },
    ];
    const COLORS = ['#10B981', '#EF4444'];

    const historyChartData = payoutHistory
    .map(cycle => ({
        name: `${memberMap.get(cycle.recipientId.toString())?.firstName || 'Unknown'}`,
        'Payout Amount': cycle.actualAmount,
    }))
    .reverse();

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
             {isNewRotation && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Zap className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-800">
                                A new full rotation has begun! The cycle starts again with the first member.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Status and Order */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Current Rotation Status</h2>
                        {currentRecipient ? (
                             <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 border-l-4 border-green-500">
                                <div className="flex items-center">
                                    <UserCheck className="h-8 w-8 text-green-600 mr-4"/>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Current Recipient</p>
                                        <p className="text-lg font-semibold text-blue-600">{currentRecipient.firstName} {currentRecipient.lastName}</p>
                                        <p className="text-sm text-gray-600">Position {currentIndex + 1} of {orderedMembers.length}</p>
                                    </div>
                                </div>
                            </div>
                        ) : <p className="text-red-600">No rotation order set.</p>}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Rotation Order</h3>
                         {userRole === 'chairperson' ? (
                            <div className="space-y-4">
                               <p className="text-sm text-blue-700 font-medium bg-blue-50 p-3 rounded-lg">💡 Drag and drop members to reorder the rotation sequence.</p>
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="members">
                                        {(provided) => (
                                            <ol {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                                {orderedMembers.map((member, index) => (
                                                    <Draggable key={member.userId._id} draggableId={member.userId._id.toString()} index={index}>
                                                        {(provided) => (
                                                            <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`p-3 rounded-lg border flex justify-between items-center cursor-grab ${index === currentIndex ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
                                                                <span className={`font-bold mr-2 ${index === currentIndex ? 'text-green-700' : 'text-gray-600'}`}>{index + 1}. {member.firstName} {member.lastName}</span>
                                                                {index === currentIndex && <span className="text-xs font-bold text-green-700">CURRENT</span>}
                                                            </li>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </ol>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        ) : (
                             <ol className="space-y-2">
                                {orderedMembers.map((member, index) => (
                                    <li key={member.userId._id} className={`p-3 rounded-lg border ${index === currentIndex ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
                                        <span className={`font-bold mr-2 ${index === currentIndex ? 'text-green-700' : 'text-gray-600'}`}>{index + 1}.</span>
                                        {member.firstName} {member.lastName}
                                        {index === currentIndex && <span className="text-xs font-bold text-green-700 ml-2"> (Current)</span>}
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                     {userRole === 'chairperson' && (
                        <div className="mt-6 pt-6 border-t">
                             <div className="flex flex-wrap gap-2">
                                <button onClick={() => handleSaveChanges(false)} disabled={isSaving} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold">Save Order</button>
                                <button onClick={() => handleSaveChanges(true)} disabled={isSaving} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-semibold">Randomize</button>
                                <button onClick={handleExecutePayout} disabled={isSaving || !allMembersPaid} className="w-full mt-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold disabled:bg-gray-400">Execute Payout</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Charts */}
                <div className="space-y-8">
                     <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Period Contributions</h3>
                         <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={contributionChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                                     {contributionChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                     ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payout History</h3>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={historyChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                                <YAxis type="category" dataKey="name" width={80} />
                                <Tooltip formatter={(value) => formatCurrency(value)}/>
                                <Legend />
                                <Bar dataKey="Payout Amount" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
```eof