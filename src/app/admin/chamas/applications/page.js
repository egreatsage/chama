'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function ManageApplications() {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };
    
    return (
        <div>
            <Toaster />
            <h1 className="text-2xl font-semibold text-gray-900">Pending Chama Applications</h1>
            <div className="mt-4 bg-white shadow rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chama Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creator</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan="4" className="text-center py-4">Loading applications...</td></tr>
                            ) : applications.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-4">No pending applications.</td></tr>
                            ) : applications.map((app) => (
                                <tr key={app._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.createdBy?.email || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleAction(app._id, 'approve')} className="text-green-600 hover:text-green-900">Approve</button>
                                            <button onClick={() => handleAction(app._id, 'reject')} className="text-red-600 hover:text-red-900">Reject</button>
                                        </div>
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

export default function ManageApplicationsPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <ManageApplications />
        </ProtectedRoute>
    );
}