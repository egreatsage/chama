'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuditLogs = async () => {
     setIsLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setAuditLogs(data.auditLogs);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Financial Audit Trail</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="8" className="text-center py-4">Loading...</td></tr>
              ) : auditLogs.map((log) => (
                <tr key={log._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.chamaId ? log.chamaId.name : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'System'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.amount ? `KES ${log.amount.toLocaleString()}`: ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.adminId ? `${log.adminId.firstName} ${log.adminId.lastName}`: 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AuditLogsPage() {
    return (
        <ProtectedRoute allowedRoles={['admin', 'treasurer']}>
            <AuditLogs />
        </ProtectedRoute>
    )
}