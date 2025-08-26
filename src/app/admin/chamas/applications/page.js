'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';

function ManageApplications() {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/chama-applications');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to fetch applications');
            }
            const data = await res.json();
            setApplications(data.applications);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAction = async (id, action) => {
        const toastId = toast.loading(`Processing action: ${action}...`);
        try {
            const res = await fetch(`/api/admin/chama-applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || `Failed to ${action}`);
            }
            toast.success(`Chama has been ${action}d!`, { id: toastId });
            fetchApplications(); // Refresh the list
            router.push('/admin/chamas'); // Fixed Router reference
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <Toaster 
                position="top-right"
                toastOptions={{
                    className: 'bg-white shadow-lg border border-gray-200',
                    duration: 4000,
                }}
            />
            
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Pending Chama Applications
                            </h1>
                            <p className="text-gray-600 mt-2">Review and manage new chama registration requests</p>
                        </div>
                        <div className="bg-blue-50 rounded-full p-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                        <h2 className="text-lg font-semibold text-gray-800">Applications Overview</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {applications.length} pending application{applications.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div className="flex items-center space-x-1">
                                            <span>Chama Name</span>
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Creator
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Date Submitted
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12">
                                            <div className="flex flex-col items-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                                <p className="mt-4 text-gray-500 font-medium">Loading applications...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : applications.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12">
                                            <div className="flex flex-col items-center">
                                                <div className="bg-gray-100 rounded-full p-6 mb-4">
                                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
                                                <p className="text-gray-500">All applications have been processed.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : applications.map((app, index) => (
                                    <tr key={app._id} className={`hover:bg-blue-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 rounded-full p-2 mr-3">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{app.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {app._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                                                    <span className="text-green-600 font-semibold text-xs">
                                                        {app.createdBy?.email?.charAt(0).toUpperCase() || 'N'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {app.createdBy?.email || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Creator</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {new Date(app.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(app.createdAt).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button 
                                                    onClick={() => handleAction(app._id, 'approve')}
                                                    className="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(app._id, 'reject')}
                                                    className="inline-flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {applications.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {applications.length} application{applications.length !== 1 ? 's' : ''}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pending Review
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ManageApplicationsPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <ManageApplications />
        </ProtectedRoute>
    );
}