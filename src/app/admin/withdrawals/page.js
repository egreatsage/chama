// src/app/admin/withdrawals/page.js

'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ManageWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // ID of the withdrawal being edited
  const [newAmount, setNewAmount] = useState(''); // New amount for the edit

  const fetchAllWithdrawals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/withdrawals');
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


  const handleEdit = (withdrawal) => {
    setEditingId(withdrawal._id);
    setNewAmount(withdrawal.amount);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewAmount('');
  };

  const handleSaveEdit = async (id) => {
    if (!newAmount || isNaN(newAmount) || Number(newAmount) <= 0) {
      return toast.error("Please enter a valid amount.");
    }

    const toastId = toast.loading('Saving changes...');
    try {
        const res = await fetch(`/api/withdrawals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: newAmount }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to save changes');
        }

        toast.success('Amount updated!', { id: toastId });
        setEditingId(null);
        fetchAllWithdrawals(); // Refresh list
    } catch (error) {
        toast.error(error.message, { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this withdrawal request?")) {
        const toastId = toast.loading('Deleting request...');
        try {
            const res = await fetch(`/api/withdrawals/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }

            toast.success('Request deleted!', { id: toastId });
            fetchAllWithdrawals(); // Refresh list
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    }
  };

  const getStatusBadge = (status) => {
     const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
      switch (status) {
        case "approved": return `${baseClasses} bg-green-100 text-green-800`;
        case "rejected": return `${baseClasses} bg-red-100 text-red-800`;
        default: return `${baseClasses} bg-yellow-100 text-yellow-800`;
      }
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
                     {w.userId ? `${w.userId.firstName} ${w.userId.lastName}` : 'User not found'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingId === w._id ? (
                      <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="w-24 p-1 border rounded"
                      />
                    ) : `KES ${w.amount.toLocaleString()}`}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                   {/* CORRECTED STATUS BADGE */}
                      <span className={getStatusBadge(w.status)}>
                       {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     {editingId === w._id ? (
                        <div className="flex space-x-2">
                           <button onClick={() => handleSaveEdit(w._id)} className="text-blue-600 hover:text-blue-900">Save</button>
                           <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">Cancel</button>
                        </div>
                     ) : (
                        <div className="flex space-x-4">
                           <button onClick={() => handleEdit(w)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                           <button onClick={() => handleDelete(w._id)} className="text-red-600 hover:text-red-900">Delete</button>
                            {w.status === 'pending' && (
                                <>
                                    <button onClick={() => handleUpdateStatus(w._id, 'approved')} className="text-green-600 hover:text-green-900">Approve</button>
                                    <button onClick={() => handleUpdateStatus(w._id, 'rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                                </>
                            )}
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

export default function ManageWithdrawalsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'treasurer']}>
      <ManageWithdrawals />
    </ProtectedRoute>
  );
}