// File Path: src/components/chama/EqualSharingTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TrendingUp, Calendar, Target, CheckCircle } from 'lucide-react';

// A helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount || 0);
};

export default function EqualSharingTab({ chama, userRole, onDataUpdate }) {
  const [cycles, setCycles] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isDistributing, setIsDistributing] = useState(false);
  console.log('Chama head:', userRole);
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
  }, [chama._id]);

  const { targetAmount = 0, savingEndDate } = chama.equalSharing || {};
  const currentBalance = chama.currentBalance || 0;
  const progress = targetAmount > 0 ? (currentBalance / targetAmount) * 100 : 0;
  const isGoalReached = currentBalance >= targetAmount && targetAmount > 0;
  
  const formattedEndDate = savingEndDate
    ? new Date(savingEndDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set';

  const handleDistribute = async () => {
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
        onDataUpdate(); // This will trigger a full refetch on the parent page
    } catch (error) {
        toast.error(error.message, { id: toastId });
    } finally {
        setIsDistributing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Savings Goal Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Savings Goal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Target Amount</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(targetAmount)}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(currentBalance)}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Savings End Date</p>
                <p className="text-xl font-bold text-gray-900">{formattedEndDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Progress Towards Goal</h3>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-medium text-gray-600">{formatCurrency(currentBalance)}</span>
            <span className="font-bold text-indigo-600">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {isGoalReached && (
          <div className="mt-6 p-4 bg-green-50 text-green-800 border-l-4 border-green-500 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 mr-3"/>
              <div>
                <h3 className="font-bold">Goal Reached!</h3>
                <p className="text-sm">The savings target has been met or exceeded. You can now distribute the funds to members.</p>
              </div>
            </div>
          </div>
        )}
        {['chairperson', 'treasurer'].includes(userRole) && isGoalReached && (
           <div className="mt-6 border-t pt-6 text-right">
                <button 
                    onClick={handleDistribute}
                    disabled={isDistributing}
                    className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    {isDistributing ? 'Processing...' : 'Distribute Funds'}
                </button>
            </div>
        )}
        {/* {userRole === 'chairperson' && isGoalReached && (
            <div className="mt-6 border-t pt-6 text-right">
                <button 
                    onClick={handleDistribute}
                    disabled={isDistributing}
                    className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                >
                    {isDistributing ? 'Processing...' : 'Distribute Funds'}
                </button>
            </div>
        )} */}
      </div>

      {/* Payout History Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payout History</h2>
        {isLoadingHistory ? <p>Loading history...</p> : cycles.length === 0 ? (
          <p className="text-gray-500">No payout cycles have been completed yet.</p>
        ) : (
          <div className="space-y-6">
            {cycles.map(cycle => (
              <div key={cycle._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <h3 className="font-bold text-lg">
                    Cycle Completed: {new Date(cycle.endDate).toLocaleDateString()}
                  </h3>
                  <span className="text-green-700 font-bold">{formatCurrency(cycle.totalCollected)}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Each member received approximately {formatCurrency(cycle.payouts[0]?.amount)}.
                </p>
                <ul className="divide-y divide-gray-100">
                  {cycle.payouts.map(payout => (
                    <li key={payout.userId._id} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                         <img src={payout.userId.photoUrl || `https://ui-avatars.com/api/?name=${payout.userId.firstName}+${payout.userId.lastName}`} alt="" className="h-8 w-8 rounded-full object-cover"/>
                         <span className="ml-3 text-sm font-medium">{payout.userId.firstName} {payout.userId.lastName}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(payout.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

