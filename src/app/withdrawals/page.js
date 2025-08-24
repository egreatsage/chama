// src/app/withdrawals/page.js

'use client';

import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';

export default function WithdrawalsPage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [fetchingWithdrawals, setFetchingWithdrawals] = useState(true);

  // Fetch withdrawal history
  const fetchWithdrawals = async () => {
    try {
      setFetchingWithdrawals(true);
      const res = await fetch("/api/withdrawals");
      const data = await res.json();
      if (res.ok) {
        setWithdrawals(data.withdrawals);
      } else {
        toast.error(data.error || "Failed to load withdrawal history");
      }
    } catch (error) {
      toast.error("Network error while loading withdrawals");
    } finally {
      setFetchingWithdrawals(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Handle withdrawal request
  const handleRequest = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Request failed");
      }

      toast.success("Withdrawal request sent successfully!");
      setAmount("");
      // Refresh the list of withdrawals
      fetchWithdrawals();

    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Withdrawals
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Request a withdrawal from your account and track its status.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Withdrawal Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Request a New Withdrawal
              </h2>
              <form onSubmit={handleRequest} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    placeholder="Enter amount to withdraw"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                    min="1"
                    disabled={loading}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !amount}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>

            {/* Quick Stats */}
             <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <span className="text-gray-700 font-medium">Pending Requests</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {withdrawals.filter(w => w.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <span className="text-gray-700 font-medium">Total Withdrawn</span>
                     <span className="text-2xl font-bold text-indigo-600">
                      KES {withdrawals.reduce((sum, w) => sum + (w.status === 'approved' ? parseFloat(w.amount) : 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
          </div>

          {/* Withdrawal History */}
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 sm:px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">
                  Withdrawal History
                </h2>
              </div>
              <div className="p-6 sm:p-8">
                {fetchingWithdrawals ? (
                  <p className="text-center text-gray-500">Loading history...</p>
                ) : withdrawals.length === 0 ? (
                  <p className="text-center text-gray-500">You have not made any withdrawal requests yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-4 px-2 font-semibold text-gray-700">Amount</th>
                          <th className="text-left py-4 px-2 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-4 px-2 font-semibold text-gray-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((w) => (
                          <tr key={w._id} className="border-b border-gray-50">
                            <td className="py-4 px-2 font-semibold text-gray-900">
                              KES {parseFloat(w.amount).toLocaleString()}
                            </td>
                            <td className="py-4 px-2">
                              <span className={getStatusBadge(w.status)}>
                                {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-gray-600 text-sm">
                              {new Date(w.createdAt).toLocaleDateString('en-KE', {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
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