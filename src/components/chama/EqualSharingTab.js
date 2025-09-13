'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TrendingUp, Calendar, Target, CheckCircle, Users, Clock, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

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
  console.log('Chama Data:', currentBalance);

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
        onDataUpdate();
    } catch (error) {
        toast.error(error.message, { id: toastId });
    } finally {
        setIsDistributing(false);
    }
  };

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
                'Recipient/Item': `${payout.userId.firstName} ${payout.userId.lastName}`,
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
  const progressChartData = [
    { name: 'Amount Saved', value: currentBalance },
    { name: 'Remaining', value: Math.max(0, targetAmount - currentBalance) },
  ];
  const COLORS = ['#10B981', '#E5E7EB'];

  const historyChartData = cycles
    .map((cycle, index) => ({
      name: `Cycle ${cycles.length - index}`,
      'Total Distributed': cycle.totalCollected,
    }))
    .reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 p-1 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Equal Sharing Overview
          </h1>
          <p className="text-gray-600 text-lg">Track your collective savings progress</p>
        </div>
         <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 sm:p-8 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                 <div className="lg:col-span-2">
                     <h2 className="text-2xl font-bold text-gray-800 mb-4">Savings Progress</h2>
                     <ResponsiveContainer width="100%" height={250}>
                         <PieChart>
                             <Pie
                                data={progressChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                             >
                                 {progressChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                             </Pie>
                             <Tooltip formatter={(value) => formatCurrency(value)} />
                             <Legend />
                             <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-800">
                                {progress.toFixed(0)}%
                            </text>
                         </PieChart>
                     </ResponsiveContainer>
                 </div>
                 
            </div>
            {isGoalReached && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-6 my-6 shadow-sm">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-4 flex-shrink-0"/>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-800 mb-1">🎉 Goal Reached!</h3>
                  <p className="text-green-700">
                    {userRole === 'chairperson' ? ' You can now distribute the funds to all members.' : ' Wait for the chairperson to distribute the funds.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        
          {userRole === 'chairperson' && isGoalReached && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Ready to distribute funds equally among all members</p>
                </div>
                <button 
                  onClick={handleDistribute}
                  disabled={isDistributing}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-8 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
                >
                  {isDistributing ? 'Processing...' : 'Distribute Funds' }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current Savings Goal Section */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 sm:p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Current Savings Goal</h2>
            <div className="hidden sm:block">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Target Amount</p>
                  <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(targetAmount)}</p>
                </div>
                <Target className="h-8 w-8 text-blue-200 group-hover:text-white transition-colors" />
              </div>
            </div>

            <div className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Current Balance</p>
                  <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(currentBalance)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200 group-hover:text-white transition-colors" />
              </div>
            </div>

            <div className="group bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium mb-1">End Date</p>
                  <p className="text-lg sm:text-xl font-bold">{formattedEndDate}</p>
                </div>
                <Calendar className="h-8 w-8 text-amber-200 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Progress Towards Goal</h3>
              <span className="text-2xl font-bold text-blue-600">{progress.toFixed(1)}%</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span className="font-medium">{formatCurrency(currentBalance)}</span>
                <span className="font-medium">{formatCurrency(targetAmount)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 h-4 rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <div className="text-center text-xs text-gray-500 mt-2">
                {targetAmount > currentBalance ? 
                  `${formatCurrency(targetAmount - currentBalance)} remaining to reach goal` :
                  'Goal achieved! 🎉'
                }
              </div>
            </div>
          </div>

          {/* Goal Reached Banner */}
          {isGoalReached && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-6 mb-6 shadow-sm">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-4 flex-shrink-0"/>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-800 mb-1">🎉 Goal Reached!</h3>
                  <p className="text-green-700">
                    Congratulations! The savings target has been met or exceeded. 
                    {userRole === 'chairperson' ? ' You can now distribute the funds to all members.' : ' Wait for the chairperson to distribute the funds.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        
          {/* Distribution Button */}
          {userRole === 'chairperson' && isGoalReached && (
            <div className="border-t border-gray-100 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Ready to distribute funds equally among all members</p>
                </div>
                <button 
                  onClick={handleDistribute}
                  disabled={isDistributing}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-8 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
                >
                  {isDistributing ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    'Distribute Funds'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payout History Section - Tabular Format */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 sm:p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Payout History</h2>
            <button
                onClick={generateHistoryExcel}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                <FileDown className="h-4 w-4 mr-2" />
                Export History
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading history...</span>
            </div>
          ) : cycles.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No payout cycles have been completed yet.</p>
              <p className="text-gray-400 text-sm mt-2">Your distribution history will appear here once cycles are completed.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {cycles.map((cycle, index) => (
                <div key={cycle._id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Cycle Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            Cycle #{cycles.length - index}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Completed: {new Date(cycle.endDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Distributed</p>
                          <span className="text-xl font-bold text-green-600">{formatCurrency(cycle.totalCollected)}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Per Member</p>
                          <span className="text-xl font-bold text-blue-600">{formatCurrency(cycle.payouts[0]?.amount)}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Members</p>
                          <span className="text-xl font-bold text-purple-600">{cycle.payouts.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabular Data */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount Received
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cycle.payouts.map((payout, payoutIndex) => (
                          <tr key={payout.userId._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payoutIndex + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img 
                                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" 
                                    src={payout.userId.photoUrl || `https://ui-avatars.com/api/?name=${payout.userId.firstName}+${payout.userId.lastName}&background=3b82f6&color=fff`}
                                    alt=""
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {payout.userId.firstName} {payout.userId.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Member
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-green-600">
                                {formatCurrency(payout.amount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <div className="h-1.5 w-1.5 bg-green-400 rounded-full mr-1.5"></div>
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cycle Summary Footer */}
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Distribution completed on {new Date(cycle.endDate).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-gray-800">
                        {cycle.payouts.length} members • {formatCurrency(cycle.totalCollected)} total
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}