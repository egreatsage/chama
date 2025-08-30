'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TrendingUp, Calendar, Target, CheckCircle, Clock } from 'lucide-react';

// A helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount || 0);
};

export default function EqualSharingTab({ chama, userRole }) {
  const [cycles, setCycles] = useState([]);
  const [isDistributing, setIsDistributing] = useState(false);

  // Fetch historical cycles when the component loads
  useEffect(() => {
    const fetchCycles = async () => {
      // We will need to create this API route next
      // For now, it will gracefully handle being empty
      try {
        const res = await fetch(`/api/chamas/${chama._id}/cycles`);
        if (res.ok) {
          const data = await res.json();
          setCycles(data.cycles);
        }
      } catch (error) {
        console.error("Could not fetch cycles", error);
      }
    };
    fetchCycles();
  }, [chama._id]);

  const { targetAmount = 0, savingEndDate } = chama.equalSharing || {};
  const currentBalance = chama.currentBalance || 0;
  const progress = targetAmount > 0 ? (currentBalance / targetAmount) * 100 : 0;
  const isGoalMet = currentBalance >= targetAmount && targetAmount > 0;
  
  const formattedEndDate = savingEndDate
    ? new Date(savingEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not set';

  const handleDistribute = async () => {
      if (!window.confirm("Are you sure you want to finalize this savings period and distribute all funds to members equally? This action cannot be undone.")) {
          return;
      }
      setIsDistributing(true);
      const toastId = toast.loading('Distributing funds...');
      try {
          const res = await fetch(`/api/chamas/${chama._id}/share`, { method: 'POST' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          toast.success('Funds distributed successfully!', { id: toastId });
          // Optionally refresh parent data
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
            <InfoCard icon={<Target className="text-blue-600"/>} title="Target Amount" value={formatCurrency(targetAmount)} color="blue"/>
            <InfoCard icon={<TrendingUp className="text-green-600"/>} title="Current Balance" value={formatCurrency(currentBalance)} color="green"/>
            <InfoCard icon={<Calendar className="text-yellow-600"/>} title="Savings End Date" value={formattedEndDate} color="yellow"/>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Progress Towards Goal</h3>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="font-medium text-gray-600">{formatCurrency(currentBalance)}</span>
            <span className="font-bold text-indigo-600">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div></div>
        </div>

        {/* Chairperson Action Button */}
        {userRole === 'chairperson' && isGoalMet && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <button 
                    onClick={handleDistribute}
                    disabled={isDistributing}
                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 transition-all">
                    {isDistributing ? 'Processing...' : 'Finalize & Distribute Funds'}
                </button>
            </div>
        )}
      </div>

      {/* Payout History Section */}
      <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Distribution History</h2>
          {cycles.length > 0 ? (
              <div className="space-y-4">
                  {cycles.map(cycle => (
                      <div key={cycle._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                              <h3 className="font-bold text-lg text-indigo-700">Cycle #{cycle.cycleNumber}</h3>
                              <span className="text-sm text-gray-500">Completed: {new Date(cycle.endDate).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600">Total Distributed: <span className="font-semibold">{formatCurrency(cycle.totalAmountDistributed)}</span></p>
                          {/* You would expand this to show a list of members and their shares */}
                      </div>
                  ))}
              </div>
          ) : (
              <p className="text-gray-500 text-center py-4">No past distribution cycles found.</p>
          )}
      </div>
    </div>
  );
}

// Helper component for info cards to keep the main component cleaner
const InfoCard = ({ icon, title, value, color }) => {
    const colors = {
        blue: 'bg-blue-50 border-blue-500',
        green: 'bg-green-50 border-green-500',
        yellow: 'bg-yellow-50 border-yellow-500',
    }
    return (
        <div className={`${colors[color]} border-l-4 p-4 rounded-lg`}>
          <div className="flex items-center">
            <div className="mr-3">{icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        </div>
    )
}
