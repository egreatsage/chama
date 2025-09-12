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
  DocumentArrowDownIcon
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
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle Kenyan numbers
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
    red: 'bg-red-50 text-red-600'
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
  
  // Form states
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
      console.log('Fetched contribution status:', data);
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
      
      // Refresh status after delay to allow for payment processing
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

  // Calculate statistics
  const stats = statusData ? (() => {
    const total = statusData.memberStatuses.length;
    const paid = statusData.memberStatuses.filter(m => m.status === 'Paid').length;
    const unpaid = statusData.memberStatuses.filter(m => m.status === 'Unpaid').length;
    const totalCollected = statusData.memberStatuses.reduce((sum, m) => sum + (m.paidAmount || 0), 0);
    const expectedTotal = statusData.memberStatuses.reduce((sum, m) => sum + (m.expectedAmount || 0), 0);
    console.log({ total, paid, unpaid, totalCollected, expectedTotal });
    return { total, paid, unpaid, totalCollected, expectedTotal };
  })() : null;

  const periodFrequency = statusData?.period?.frequency ? 
    statusData.period.frequency.charAt(0).toUpperCase() + statusData.period.frequency.slice(1) : 
    '';

    const generateExcel = () => {
      if (!statusData || !statusData.memberStatuses) {
          toast.error("No contribution data available to export.");
          return;
      }
  
      // Prepare data for Excel
      const excelData = statusData.memberStatuses.map(member => ({
          'First Name': member.memberInfo.firstName || '',
          'Last Name': member.memberInfo.lastName || '',
          'Amount Paid': member.paidAmount || 0,
          'Expected Amount': member.expectedAmount || 0,
          'Date': member.lastPayment ? new Date(member.lastPayment.date).toLocaleDateString() : 'N/A',
          'Status': member.status || 'Unpaid',
          'Last Payment Method': member.lastPayment ? member.lastPayment.method : 'N/A'
      }));
  
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
  
      // Set column widths
      const columnWidths = [
          { wch: 15 }, // First Name
          { wch: 15 }, // Last Name  
          { wch: 15 }, // Amount Paid
          { wch: 15 }, // Expected Amount
          { wch: 15 }, // Date
          { wch: 15 }, // Status
          { wch: 20 }  // Last Payment Method
      ];
      worksheet['!cols'] = columnWidths;
  
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contributions');
  
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `${chama.name}_contributions_${currentDate}.xlsx`;
  
      // Write and download file
      XLSX.writeFile(workbook, filename);
  };

  if (!chama) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chama information not available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            icon={UsersIcon}
            title="Total Members"
            value={stats.total}
            color="blue"
          />
          <StatsCard 
            icon={CheckCircleIcon}
            title="Paid Members"
            value={stats.paid}
            subtitle={`${((stats.paid / stats.total) * 100).toFixed(0)}% complete`}
            color="green"
          />
          <StatsCard 
            icon={XCircleIcon}
            title="Unpaid Members"
            value={stats.unpaid}
            color="red"
          />
          <StatsCard 
            icon={CurrencyDollarIcon}
            title="Contribution Progress"
            value={formatCurrency(stats.totalCollected)}
            subtitle={`of ${formatCurrency(stats.expectedTotal)}`}
            color="blue"
          />
        </div>
      )}
    
    
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Forms Section */}
        <div className="xl:col-span-1 space-y-6">
          {/* M-Pesa Payment Form */}
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

          {/* Manual Recording Form - Only for authorized roles */}
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

        {/* Status Table Section */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {periodFrequency} Contribution Status
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {statusData ? (
                      <>
                        Period ending {new Date(statusData.period.end).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </>
                    ) : (
                      'Loading period information...'
                    )}
                  </p>
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

            {/* Content */}
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
                              of {formatCurrency(expectedAmount)}
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
