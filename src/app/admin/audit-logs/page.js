// File Path: src/app/admin/audit-logs/page.js
'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { BookOpen, RefreshCw } from 'lucide-react';

// Helper to format the date nicely
const formatDate = (dateString) => {
    try {
        return new Date(dateString).toLocaleString('en-KE', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    } catch (e) {
        return 'Invalid Date';
    }
}

/**
 * Safely gets the user's name from a potentially unpopulated object.
 * @param {object | string | null} userObject - The user object or ID.
 * @returns {string} The formatted name or a fallback string.
 */
const getUserName = (userObject) => {
    if (!userObject) return 'System'; // No user associated with the event (e.g., system action)
    // If populated, it's an object with names.
    if (userObject.firstName || userObject.lastName) {
        return `${userObject.firstName || ''} ${userObject.lastName || ''}`.trim();
    }
    // If it's just a string ID (population failed), show part of the ID for debugging.
    if (typeof userObject === 'string') {
        return `User ID: ...${userObject.slice(-6)}`;
    }
    // Fallback for any other unexpected structure.
    return 'Unknown User';
};

/**
 * Safely gets the admin's name from a potentially unpopulated object.
 * @param {object | string | null} adminObject - The admin object or ID.
 * @returns {string} The formatted name or a fallback string.
 */
const getAdminName = (adminObject) => {
    if (!adminObject) return 'N/A'; // Action was not performed by an admin (e.g., user's own contribution)
    if (adminObject.firstName || adminObject.lastName) {
        return `${adminObject.firstName || ''} ${adminObject.lastName || ''}`.trim();
    }
    if (typeof adminObject === 'string') {
        return `Admin ID: ...${adminObject.slice(-6)}`;
    }
    return 'Unknown Admin';
};


// Main component to display the audit logs
function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuditLogs = async () => {
     setIsLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (!res.ok) throw new Error('Failed to fetch audit trail data');
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
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-indigo-600" />
              Financial Audit Trail
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              A complete and immutable log of all financial activities across the platform.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
             <button
              onClick={fetchAuditLogs}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chama</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admin</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan="8" className="text-center py-10 text-gray-500">Loading audit trail...</td></tr>
                ) : auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{log.chamaId?.name || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{getUserName(log.userId)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {log.action.replace(/_/g, ' ')}
                        </span>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold ${log.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {log.amount != null ? `KES ${log.amount.toLocaleString()}`: ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{getAdminName(log.adminId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

