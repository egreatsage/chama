"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function ContributionsPage() {
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [fetchingContributions, setFetchingContributions] = useState(true);

  // Fetch contribution history
  const fetchContributions = async () => {
    try {
      setFetchingContributions(true);
      const res = await fetch("/api/contributions");
      const data = await res.json();
      if (res.ok) {
        setContributions(data.contributions);
      } 
    } catch (error) {
      toast.error("Network error while loading contributions");
    } finally {
      setFetchingContributions(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  // Handle STK push
  const handlePay = async () => {
    if (!amount || !phoneNumber) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Payment failed");
      } else {
        toast.success("STK push sent! Check your phone and enter PIN", {
          duration: 6000,
        });
        setAmount("");
        setPhoneNumber("");
        // Refresh contributions after a delay to allow transaction to process
        setTimeout(() => {
          fetchContributions();
        }, 2000);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "confirmed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#393B65',
            color: '#F1E3F0',
            border: '1px solid #A294C7',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F1E3F0',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F1E3F0',
            },
          },
        }}
      />
      
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Contributions
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Make secure payments using M-Pesa and track your contribution history
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contribution Form */}
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#A294C7' }}>
                    <span className="text-white font-bold">₹</span>
                  </div>
                  Make a Contribution
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (KES)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      style={{ focusRingColor: '#A294C7' }}
                      min="1"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="254712345678 or 0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      style={{ focusRingColor: '#A294C7' }}
                      disabled={loading}
                    />
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={loading || !amount || !phoneNumber}
                    className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{ 
                      backgroundColor: (loading || !amount || !phoneNumber) ? '#9CA3AF' : '#393B65',
                      boxShadow: (loading || !amount || !phoneNumber) ? 'none' : '0 4px 14px 0 rgba(57, 59, 101, 0.3)'
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>📱</span>
                        <span>Pay with M-Pesa</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h3>
                <div className="space-y-4">
                 
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#F1E3F0' }}>
                    <span className="text-gray-700 font-medium">Total Amount</span>
                    <span className="text-2xl font-bold" style={{ color: '#393B65' }}>
                      KES {contributions.reduce((sum, c) => sum + (c.status === 'confirmed' ? parseFloat(c.amount) : 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contribution History */}
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 rounded-full mr-3 flex items-center justify-center" style={{ backgroundColor: '#A294C7' }}>
                    <span className="text-white font-bold">📊</span>
                  </div>
                  Contribution History
                </h2>
              </div>
              
              <div className="p-6 sm:p-8">
                {fetchingContributions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#A294C7', borderTopColor: 'transparent' }}></div>
                    <span className="ml-3 text-gray-600">Loading contributions...</span>
                  </div>
                ) : contributions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F1E3F0' }}>
                      <span className="text-2xl">📝</span>
                    </div>
                    <p className="text-gray-500 text-lg">No contributions yet</p>
                    <p className="text-gray-400 text-sm mt-2">Your contribution history will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-4 px-2 font-semibold text-gray-700">Amount</th>
                          <th className="text-left py-4 px-2 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-4 px-2 font-semibold text-gray-700 hidden sm:table-cell">Receipt</th>
                          <th className="text-left py-4 px-2 font-semibold text-gray-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contributions.map((c, index) => (
                          <tr key={c._id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                            <td className="py-4 px-2 font-semibold text-gray-900">
                              KES {parseFloat(c.amount).toLocaleString()}
                            </td>
                            <td className="py-4 px-2">
                              <span className={getStatusBadge(c.status)}>
                                {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-gray-600 hidden sm:table-cell font-mono text-sm">
                              {c.mpesaReceiptNumber || "-"}
                            </td>
                            <td className="py-4 px-2 text-gray-600 text-sm">
                              {c.transactionDate
                                ? new Date(
                                    c.transactionDate.length === 14
                                      ? `${c.transactionDate.slice(0,4)}-${c.transactionDate.slice(4,6)}-${c.transactionDate.slice(6,8)}T${c.transactionDate.slice(8,10)}:${c.transactionDate.slice(10,12)}:${c.transactionDate.slice(12,14)}`
                                      : c.transactionDate
                                  ).toLocaleDateString('en-KE', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}