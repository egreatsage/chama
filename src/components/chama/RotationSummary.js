// src/components/chama/RotationSummary.js
'use client';

import { TrendingUp, Calendar, Users, DollarSign, Award } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

export default function RotationSummary({ chama, currentUser }) {
  const { rotationPayout, contributionFrequency } = chama;
  const rotationOrder = rotationPayout?.rotationOrder || [];
  const currentIndex = rotationPayout?.currentRecipientIndex || 0;
  
  // 1. Calculate Cycle Stats
  const targetAmount = rotationPayout?.targetAmount || 0;
  const totalRotationValue = targetAmount * rotationOrder.length;
  
  // 2. Find "My" Turn
  // rotationOrder contains IDs. We need to find where currentUser.id is in that list.
  const myIndex = rotationOrder.findIndex(id => id.toString() === currentUser.id);
  const myTurnIsNext = myIndex === currentIndex;
  const iHaveBeenPaid = myIndex < currentIndex && myIndex !== -1;
  
  // 3. Estimate Dates (Simple calculation based on frequency)
  const getNextDate = () => {
    const today = new Date();
    // This is an estimate. Real apps might store "nextPayoutDate" in DB.
    if (contributionFrequency === 'weekly') return new Date(today.setDate(today.getDate() + 7));
    if (contributionFrequency === 'monthly') return new Date(today.setMonth(today.getMonth() + 1));
    return today;
  };

  return (
    <div className="space-y-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: The Pot */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Payout Amount</h3>
                <span className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(targetAmount)}</p>
            <p className="text-sm text-green-600 mt-1">Per person, every {contributionFrequency}</p>
        </div>

        {/* Card 2: Progress */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Rotation Progress</h3>
                <span className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                </span>
            </div>
            <div className="flex items-end space-x-2">
                <p className="text-2xl font-bold text-gray-800">{currentIndex + 1}</p>
                <p className="text-gray-400 mb-1">/ {rotationOrder.length} Members</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${((currentIndex + 1) / rotationOrder.length) * 100}%` }}
                ></div>
            </div>
        </div>

        {/* Card 3: My Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Your Position</h3>
                <span className="p-2 bg-purple-100 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                </span>
            </div>
            {myIndex === -1 ? (
                <p className="text-sm text-gray-500">You are not in this rotation.</p>
            ) : (
                <>
                    <p className="text-2xl font-bold text-gray-800">#{myIndex + 1}</p>
                    <p className="text-sm mt-1 font-medium">
                        {myTurnIsNext ? <span className="text-green-600">You are next! 🎉</span> : 
                         iHaveBeenPaid ? <span className="text-gray-500">Paid this round ✅</span> :
                         <span className="text-orange-500">Waiting for your turn ⏳</span>}
                    </p>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
