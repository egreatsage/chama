'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  XCircleIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  TagIcon, // Added TagIcon icon
  InformationCircleIcon
} from '@heroicons/react/24/solid';

const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount || 0);
  } catch (error) {
    return `KES ${(amount || 0).toLocaleString()}`;
  }
};

const formatPhoneNumber = (phone) => {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('254')) {
    return digits;
  } else if (digits.startsWith('0')) {
    return '254' + digits.slice(1);
  } else if (digits.length === 9) {
    return '254' + digits;
  }
  return digits;
};

const StatusBadge = ({ status }) => {
  const styles = {
    'Paid': 'bg-green-50 text-green-700 border-green-200',
    'Partially Paid': 'bg-amber-50 text-amber-700 border-amber-200',
    'Unpaid': 'bg-red-50 text-red-700 border-red-200'
  };

  const icons = {
    'Paid': CheckCircleIcon,
    'Partially Paid': ExclamationCircleIcon,
    'Unpaid': XCircleIcon
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon className="w-3 h-3 mr-1 flex-shrink-0" />
      <span className="truncate">{status}</span>
    </span>
  );
};

const StatsCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600' // Added color for TagIcon
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default function ContributionsTab({ chama, members = [], userRole, currentUserId }) {
  const [statusData, setStatusData] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [error, setError] = useState(null);
  
  const [mpesaAmount, setMpesaAmount] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const fetchContributionStatus = async () => {
    if (!chama?._id) return;
    
    setIsLoadingStatus(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/chamas/${chama._id}/contribution-status`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setStatusData(data);
    } catch (error) {
      console.error('Failed to fetch contribution status:', error);
      setError(error.message);
      toast.error(`Failed to load contribution status: ${error.message}`);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchContributionStatus();
  }, [chama?._id]);

  const handleMpesaPay = async (e) => {
    e.preventDefault();
    
    if (!mpesaAmount || !mpesaPhone) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(mpesaAmount);
    if (amount <= 0 || amount > 300000) {
      toast.error('Amount must be between KES 1 and KES 300,000');
      return;
    }

    const formattedPhone = formatPhoneNumber(mpesaPhone);
    if (formattedPhone.length < 12) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsPaying(true);
    const toastId = toast.loading('Sending M-Pesa prompt...');
    
    try {
      const res = await fetch(`/api/mpesa/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amount, 
          phoneNumber: formattedPhone, 
          chamaId: chama._id 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'STK Push failed');
      
      toast.success('Payment prompt sent! Please check your phone and enter your M-Pesa PIN.', { 
        id: toastId, 
        duration: 8000 
      });
      
      setMpesaAmount('');
      setMpesaPhone('');
      
      setTimeout(fetchContributionStatus, 25000);
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      toast.error(error.message, { id: toastId });
    } finally {
      setIsPaying(false);
    }
  };

  const handleManualRecord = async (e) => {
    e.preventDefault();
    
    if (!selectedMember || !manualAmount) {
      toast.error('Please select a member and enter an amount');
      return;
    }

    const amount = parseFloat(manualAmount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setIsRecording(true);
    const toastId = toast.loading('Recording contribution...');
    
    try {
      const res = await fetch(`/api/chamas/${chama._id}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          memberId: selectedMember, 
          amount: amount 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record contribution');
      
      toast.success('Contribution recorded successfully!', { id: toastId });
      setManualAmount('');
      setSelectedMember('');
      fetchContributionStatus();
    } catch (error) {
      console.error('Manual record error:', error);
      toast.error(error.message, { id: toastId });
    } finally {
      setIsRecording(false);
    }
  };

  const stats = statusData ? (() => {
    const total = statusData.memberStatuses.length;
    const paid = statusData.memberStatuses.filter(m => m.status === 'Paid').length;
    return { total, paid };
  })() : null;

  const periodFrequency = statusData?.period?.frequency ? 
    statusData.period.frequency.charAt(0).toUpperCase() + statusData.period.frequency.slice(1) : 
    '';

    const generateExcel = () => {
      if (!statusData || !statusData.memberStatuses) {
          toast.error("No contribution data available to export.");
          return;
      }
  
      const excelData = statusData.memberStatuses.map(member => ({
          'First Name': member.memberInfo.firstName || '',
          'Last Name': member.memberInfo.lastName || '',
          'Amount Paid (Period)': member.paidAmount || 0,
          'Expected Amount (Period)': member.expectedAmount || 0,
          'Date': member.lastPayment ? new Date(member.lastPayment.date).toLocaleDateString() : 'N/A',
          'Status (Period)': member.status || 'Unpaid',
          'Last Payment Method': member.lastPayment ? member.lastPayment.method : 'N/A'
      }));
  
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
  
      worksheet['!cols'] = [
          { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
      ];
  
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contributions');
  
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `${chama.name}_contributions_${currentDate}.xlsx`;
  
      XLSX.writeFile(workbook, filename);
  };

  const expectedAmountPerMember = statusData && chama?.operationType === 'equal_sharing' && chama?.equalSharing?.targetAmount && statusData.memberStatuses.length > 0
    ? chama.equalSharing.currentCycle.targetAmount / statusData.memberStatuses.length
    : null;

  if (!chama) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chama information not available</p>
      </div>
    );
  }

  // **MODIFIED a little bit to show the TagIcon amount for equal sharing chamas**
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {chama.operationType === 'equal_sharing' && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Each member's total contribution goal is approximately{' '}
                            <span className="font-bold">{formatCurrency((chama.equalSharing.currentCycletargetAmount || 0) / (members.length || 1))}</span>
                            , calculated as (Target Amount / Number of Members).
                        </p>
                    </div>
                </div>
            </div>
        )}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">
                           NOTE, Amount in the contribution status table reflects payments made during the current period only.Loans,Expenses and Incomes affect the chama's overall balance but are not included in this table.
                        </p>
                    </div>
                </div>
            </div>
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            icon={UsersIcon}
            title="Active Members"
            value={stats.total}
            color="blue"
          />
          <StatsCard 
            icon={CheckCircleIcon}
            title="Paid (This Period)"
            value={stats.paid}
            subtitle={`${stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(0) : 0}% complete`}
            color="green"
          />
           {chama.operationType === 'equal_sharing' && (
            <StatsCard 
              icon={TagIcon}
              title="Overall Savings Goal"
              value={formatCurrency(chama.equalSharing?.targetAmount)}
              color="purple"
            />
          )}
           {chama.operationType === 'rotation_payout' && (
            <StatsCard 
              icon={TagIcon}
              title="Overall Savings Goal"
              value={formatCurrency(chama.rotationPayout?.targetAmount)}
              color="purple"
            />
          )}
          <StatsCard 
            icon={CurrencyDollarIcon}
            title="Contribution Progress"
            value={formatCurrency(chama.currentBalance)}
            subtitle={chama.operationType === 'equal_sharing' ? `of ${formatCurrency(chama.equalSharing?.targetAmount)}` : chama.operationType === 'rotation_payout' ? `of ${formatCurrency(chama.rotationPayout?.targetAmount)}` : `Total Collected`}
            color="blue"
          />
        </div>
      )}
    
    
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay with M-Pesa</h3>
              <form onSubmit={handleMpesaPay} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (KES)
                  </label>
                  <input 
                    type="number" 
                    value={mpesaAmount} 
                    onChange={(e) => setMpesaAmount(e.target.value)} 
                    placeholder="e.g., 1000"
                    min="1"
                    max="300000"
                    className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    M-Pesa Number
                  </label>
                  <input 
                    type="tel" 
                    value={mpesaPhone} 
                    onChange={(e) => setMpesaPhone(e.target.value)} 
                    placeholder="0712345678"
                    className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isPaying || !mpesaAmount || !mpesaPhone} 
                  className="w-full bg-green-600 text-white font-medium py-2.5 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isPaying ? 'Processing...' : 'Pay Now'}
                </button>
              </form>
            </div>
          </div>

          {['chairperson', 'treasurer'].includes(userRole) && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Cash Payment</h3>
                <form onSubmit={handleManualRecord} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Member
                    </label>
                    <select 
                      value={selectedMember} 
                      onChange={(e) => setSelectedMember(e.target.value)} 
                      className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      required
                    >
                      <option value="">Choose a member...</option>
                      {members.map(member => (
                        <option key={member.userId._id} value={member.userId._id}>
                          {member.userId.firstName} {member.userId.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (KES)
                    </label>
                    <input 
                      type="number" 
                      value={manualAmount} 
                      onChange={(e) => setManualAmount(e.target.value)} 
                      placeholder="e.g., 1000"
                      min="1"
                      className="w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      required 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isRecording || !selectedMember || !manualAmount} 
                    className="w-full bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isRecording ? 'Recording...' : 'Record Payment'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {periodFrequency} Contribution Status
                  </h3>
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
    {chama.operationType === 'equal_sharing' && chama.equalSharing?.savingStartDate ? (
      <>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
          </svg>
          <span className="font-semibold text-gray-700">Period:</span>
        </div>
        <div className="text-gray-600 ml-6 sm:ml-0">
          <span className="bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
            {new Date(chama.equalSharing.savingStartDate).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          {chama.equalSharing.savingEndDate && (
            <>
              <span className="mx-2 text-gray-400">→</span>
              <span className="bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                {new Date(chama.equalSharing.savingEndDate).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </>
          )}
        </div>
      </>
    ) : chama.operationType === 'rotation_payout' && chama.rotationPayout?.savingStartDate ? (
      <>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span className="font-semibold text-gray-700">Started:</span>
        </div>
        <span className="bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm text-gray-600 ml-6 sm:ml-0">
          {new Date(chama.rotationPayout.savingStartDate).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </>
    ) : (
      <div className="flex items-center gap-2 text-gray-500">
        <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="italic">Loading period information...</span>
      </div>
    )}
  </div>
                   </div>
                </div>

               <div className='flex space-x-2'>
                  <button
                    onClick={generateExcel}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Download Excel
                </button>
                <button
                  onClick={fetchContributionStatus}
                  disabled={isLoadingStatus}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <ArrowPathIcon  className={`h-4 w-4 mr-2 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
               </div>
              </div>
            </div>

            <div className="p-0">
              {error ? (
                <div className="p-6 text-center">
                  <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 font-medium">Failed to load contribution data</p>
                  <p className="text-gray-500 text-sm mt-1">{error}</p>
                  <button
                    onClick={fetchContributionStatus}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Try Again
                  </button>
                </div>
              ) : isLoadingStatus ? (
                <div className="p-12 text-center">
                  <ArrowPathIcon  className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500">Loading contribution status...</p>
                </div>
              ) : statusData?.memberStatuses?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Last Payment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statusData.memberStatuses.map(({ memberInfo, status, paidAmount, expectedAmount, lastPayment }) => (
                        <tr key={memberInfo._id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center min-w-0">
                              <img 
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" 
                                src={memberInfo.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberInfo.firstName)}+${encodeURIComponent(memberInfo.lastName)}&background=random`} 
                                alt={`${memberInfo.firstName} ${memberInfo.lastName}`}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(memberInfo.firstName)}+${encodeURIComponent(memberInfo.lastName)}&background=random`;
                                }}
                              />
                              <div className="ml-3 min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {memberInfo.firstName} {memberInfo.lastName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={status} />
                          </td> 
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="font-medium text-gray-900">
                              {formatCurrency(paidAmount)}
                            </div>
                            <div className="text-gray-500">
                              of {formatCurrency(expectedAmountPerMember !== null ? expectedAmountPerMember : expectedAmount)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                            {lastPayment ? (
                              <div>
                                <div className="font-medium capitalize text-gray-900">
                                  {lastPayment.method}
                                </div>
                                <div className="text-gray-500">
                                  {new Date(lastPayment.date).toLocaleDateString('en-KE')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">No payments yet</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No member contribution data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}