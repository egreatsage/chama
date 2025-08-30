// src/components/chama/EqualSharingTab.js
'use client';

import { TrendingUp, Calendar, Target } from 'lucide-react';

// A helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount || 0);
};

export default function EqualSharingTab({ chama }) {
  // Destructure the specific settings for this chama type
  const {
    targetAmount = 0,
    savingEndDate,
  } = chama.equalSharing || {};

  // Assuming 'currentBalance' is a property on the main chama object
  const currentBalance = chama.currentBalance || 0;

  // Calculate progress percentage
  const progress = targetAmount > 0 ? (currentBalance / targetAmount) * 100 : 0;
  const formattedEndDate = savingEndDate
    ? new Date(savingEndDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not set';

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Savings Goal Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Target Amount Card */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Target Amount</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(targetAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Current Balance Card */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">
                Current Balance
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(currentBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* End Date Card */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Savings End Date</p>
              <p className="text-xl font-bold text-gray-900">
                {formattedEndDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Progress Towards Goal
        </h3>
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="font-medium text-gray-600">
            {formatCurrency(currentBalance)}
          </span>
          <span className="font-bold text-indigo-600">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}