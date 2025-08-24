// src/app/admin/withdrawals/page.js

'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// This is the main component for the page
function ManageWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllWithdrawals = async () => {
    // Note: You'll need a new API route to fetch ALL withdrawals for the admin.
    // For now, let's create it. The user-facing one only gets their own.
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals'); // We'll create this next
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setWithdrawals(data.withdrawals);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllWithdrawals();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const toastId = toast.loading('Updating status...');
    try {
      const res = await fetch(`/api/withdrawals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }

      toast.success(`Request ${status}!`, { id: toastId });
      fetchAllWithdrawals(); // Refresh the list
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  const getStatusBadge = (status) => {
    // ... (same getStatusBadge function as in withdrawals/page.js)
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Withdrawal Requests</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
           <tbody className="bg-white divide-y divide-gray-200">
  {isLoading ? (
    <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
  ) : withdrawals.map((w) => (
    <tr key={w._id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {/* Change this to display the name from the populated object */}
        {w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : 'User not found'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">KES {w.amount.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {/* You need to define getStatusBadge or copy it from withdrawals/page.js */}
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            w.status === 'approved' ? 'bg-green-100 text-green-800' :
            w.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
        }`}>
            {w.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {w.status === 'pending' && (
          <div className="flex space-x-2">
            <button onClick={() => handleUpdateStatus(w._id, 'approved')} className="text-green-600 hover:text-green-900">Approve</button>
            <button onClick={() => handleUpdateStatus(w._id, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
          </div>
        )}
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Wrap the component in the ProtectedRoute
export default function ManageWithdrawalsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'treasurer']}>
      <ManageWithdrawals />
    </ProtectedRoute>
  );
}