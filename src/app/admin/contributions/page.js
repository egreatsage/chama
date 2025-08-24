// src/app/admin/withdrawals/page.js

'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserIcon } from 'lucide-react';

function ManageContributions() {
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); 


  

  const fetchAllContributions = async () => {
     setIsLoading(true);
    try {
      const res = await fetch('/api/admin/contributions');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setContributions(data.contributions);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContributions();
  }, []);


  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete these details?")) {
        const toastId = toast.loading('Deleting details...');
        try {
            const res = await fetch(`/api/contributions/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }

            toast.success('Request deleted!', { id: toastId });
            fetchAllContributions(); // Refresh list
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    }
  };

 

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Contributions</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Person</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MpesaReceiptNumber</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ContributionDate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">phoneNumber</th>              

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
              ) : contributions.map((c) => (
                <tr key={c._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                     {c?.photoUrl ? (
                    <img
                      className="h-8 w-8 rounded-full mr-3 object-cover border-2 border-gray-200"
                      src={c.photoUrl}
                      alt={c.fullName}
                      onError={(c) => {
                        // Fallback to user icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <UserIcon 
                    className={`h-5 w-5 mr-2 ${c?.photoUrl ? 'hidden' : 'block'}`} 
                  />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.firstName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.MpesaReceiptNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.failureReason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.transactionDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:text-red-900">Delete</button> 
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

export default function ManageContributionsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'treasurer']}>
      <ManageContributions />
    </ProtectedRoute>
  );
}