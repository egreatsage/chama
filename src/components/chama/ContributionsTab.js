'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, DollarSign, List, CreditCard, Wallet } from 'lucide-react';

// A helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount || 0);
};

export default function ContributionsTab({ chama, members, userRole, currentUserId }) {
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mpesaAmount, setMpesaAmount] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // For manual entry by chairperson
  const [manualAmount, setManualAmount] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const fetchContributions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chamas/${chama._id}/contributions`);
      if (!res.ok) throw new Error('Failed to fetch contributions');
      const data = await res.json();
      setContributions(data.contributions);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [chama._id]);

  const handleMpesaPay = async (e) => {
      e.preventDefault();
      setIsPaying(true);
      const toastId = toast.loading('Sending M-Pesa prompt...');
      try {
          // NOTE: This assumes your stkpush API is adapted to take chamaId
          const res = await fetch(`/api/mpesa/stkpush`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: mpesaAmount, phoneNumber: mpesaPhone, chamaId: chama._id }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'STK Push failed');
          toast.success('Prompt sent to your phone. Please enter your PIN.', { id: toastId, duration: 6000 });
          setMpesaAmount('');
          setMpesaPhone('');
      } catch (error) {
          toast.error(error.message, { id: toastId });
      } finally {
          setIsPaying(false);
      }
  };

  const handleManualRecord = async (e) => {
      e.preventDefault();
      setIsRecording(true);
      const toastId = toast.loading('Recording contribution...');
      try {
          const res = await fetch(`/api/chamas/${chama._id}/contributions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ memberId: selectedMember, amount: manualAmount }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          toast.success('Contribution recorded!', { id: toastId });
          setManualAmount('');
          setSelectedMember('');
          fetchContributions(); // Refresh the list
      } catch (error) {
          toast.error(error.message, { id: toastId });
      } finally {
          setIsRecording(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Contributions</h2>
          <p className="text-gray-600">Manage and track your chama contributions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column: Forms */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* M-Pesa Form */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">M-Pesa Payment</h3>
              </div>
              
              <form onSubmit={handleMpesaPay} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
                  <input 
                    type="number" 
                    value={mpesaAmount} 
                    onChange={(e) => setMpesaAmount(e.target.value)} 
                    placeholder="Enter amount" 
                    className="w-full border text-gray-800 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    value={mpesaPhone} 
                    onChange={(e) => setMpesaPhone(e.target.value)} 
                    placeholder="e.g., 0712345678" 
                    className="w-full border text-gray-800 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isPaying} 
                  className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isPaying ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>Pay Now</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Manual Entry for Admins */}
            {['chairperson', 'treasurer'].includes(userRole) && (
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-6">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <Wallet className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">Manual Entry</h3>
                  </div>
                  
                  <form onSubmit={handleManualRecord} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Member</label>
                      <select 
                        value={selectedMember} 
                        onChange={(e) => setSelectedMember(e.target.value)} 
                        className="w-full border text-gray-800 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                        required
                      >
                        <option value="">Choose a member</option>
                        {members.map(member => (
                            <option key={member.userId._id} value={member.userId._id}>
                              {member.userId.firstName} {member.userId.lastName}
                            </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES)</label>
                      <input 
                        type="number" 
                        value={manualAmount} 
                        onChange={(e) => setManualAmount(e.target.value)} 
                        placeholder="Enter amount" 
                        className="w-full border text-gray-800 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                        required 
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isRecording} 
                      className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      {isRecording ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <span>Record Payment</span>
                          <DollarSign className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
            )}
          </div>

          {/* Right Column: Contribution History */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
              
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-lg mr-3">
                    <List className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900">Contribution History</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading contributions...</span>
                  </div>
                ) : contributions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                      <DollarSign className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No contributions yet</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to contribute!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {contributions.map((c, index) => (
                      <div 
                        key={c._id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-150 border-l-4 border-l-transparent hover:border-l-green-500"
                      >
                        <div className="flex items-center mb-3 sm:mb-0">
                          <div className="relative">
                            <img 
                              src={c.userId?.photoUrl || `https://ui-avatars.com/api/?name=${c.userId?.firstName}+${c.userId?.lastName}&background=e5e7eb&color=374151`} 
                              alt={`${c.userId?.firstName} ${c.userId?.lastName}`}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                              {c.paymentMethod === 'mpesa' ? (
                                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                              ) : (
                                <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <p className="font-semibold text-gray-900 text-base">
                              {c.userId?.firstName} {c.userId?.lastName}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                c.paymentMethod === 'mpesa' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {c.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Cash'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-left sm:text-right ml-16 sm:ml-0">
                          <p className="font-bold text-lg text-green-600">
                            {formatCurrency(c.amount)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(c.createdAt).toLocaleDateString('en-KE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary Cards - Bottom Section */}
        {contributions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Collected</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(contributions.reduce((sum, c) => sum + c.amount, 0))}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contributions</p>
                  <p className="text-2xl font-bold text-blue-600">{contributions.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <List className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Contributors</p>
                  <p className="text-2xl font-bold text-red-600">
                    {new Set(contributions.map(c => c.userId._id)).size}
                  </p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <ArrowRight className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}