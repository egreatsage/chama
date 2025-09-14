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


export default function EqualSharingTab({ chama, userRole, onDataUpdate, cycles = [] }) {
  const [isDistributing, setIsDistributing] = useState(false);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  
  // Use the new currentCycle sub-document for active cycle data
  const { targetAmount = 0} = chama.equalSharing?.currentCycle || {};
  const currentBalance = chama.currentBalance || 0;
  const isGoalReached = currentBalance > 0 && currentBalance >= targetAmount;
  // A cycle is complete if the balance is 0 AND there's a target (meaning a cycle was active)
  const isCycleComplete = cycles.length >= chama.cycleCount && targetAmount > 0;

 const handleDistribute = async () => {
    // Create confirmation toast
    toast((t) => (
        <div className="flex flex-col gap-3">
            <p className="font-medium">Are you sure you want to distribute the funds?</p>
            <p className="text-sm text-gray-600">This will reset the current balance and start a new cycle.</p>
            <div className="flex gap-2 justify-end">
                <button
                    onClick={() => {
                        toast.dismiss(t.id);
                        // Proceed with distribution
                        performDistribution();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                    Yes, Distribute
                </button>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    ), {
        duration: Infinity, // Keep open until user decides
        style: {
            minWidth: '350px',
        },
    });

    // Separate function to handle the actual distribution
    const performDistribution = async () => {
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
        njndjndjndjndjn
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
            {cycles.length === 0 ? <div className="text-center py-12 text-gray-500">No payout cycles completed yet.</div> : (
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