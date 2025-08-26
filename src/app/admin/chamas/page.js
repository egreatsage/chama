'use client';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon, CheckIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

function ManageChamas() {
    const [chamas, setChamas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', description: '' });
    
    const fetchChamas = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/chamas');
            if (!res.ok) throw new Error('Failed to fetch Chamas');
            const data = await res.json();
            setChamas(data.chamas);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChamas();
    }, []);

    const handleEdit = (chama) => {
        setEditingId(chama._id);
        setEditFormData({ name: chama.name, description: chama.description });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = async (id) => {
        const toastId = toast.loading('Saving...');
        try {
            const res = await fetch(`/api/admin/chamas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            });
            if (!res.ok) throw new Error('Failed to save changes');
            toast.success('Chama updated!', { id: toastId });
            setEditingId(null);
            fetchChamas();

        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This will delete the Chama and all its members permanently.")) {
            const toastId = toast.loading('Deleting...');
            try {
                const res = await fetch(`/api/admin/chamas/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('Failed to delete Chama');
                toast.success('Chama deleted!', { id: toastId });
                fetchChamas();
            } catch (error) {
                toast.error(error.message, { id: toastId });
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            active: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            suspended: 'bg-red-100 text-red-800 border-red-200',
            inactive: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.inactive}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Toaster position="top-right" />
            
            {/* Header */}
            <div className="mb-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Chamas</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Oversee all registered Chamas and their activities
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
                        <Link 
                            href="/admin/chamas/applications"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View Applications
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <PlusIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Total Chamas</p>
                            <p className="text-2xl font-bold text-gray-900">{chamas.length}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckIcon className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Active</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {chamas.filter(c => c.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <EyeIcon className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {chamas.filter(c => c.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <XMarkIcon className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Suspended</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {chamas.filter(c => c.status === 'suspended').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">All Chamas</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Chama Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Creator
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                                            <p className="text-sm text-gray-500">Loading Chamas...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : chamas.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <PlusIcon className="h-12 w-12 text-gray-400 mb-4" />
                                            <p className="text-lg font-medium text-gray-900">No Chamas found</p>
                                            <p className="text-sm text-gray-500">Get started by creating your first Chama</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                chamas.map((chama) => (
                                    <tr key={chama._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingId === chama._id ? (
                                                <div className="space-y-2">
                                                    <input 
                                                        value={editFormData.name} 
                                                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        placeholder="Chama name"
                                                    />
                                                    <textarea 
                                                        value={editFormData.description} 
                                                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} 
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        placeholder="Description"
                                                        rows="2"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{chama.name}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {chama.description || 'No description available'}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-indigo-600">
                                                            {chama.createdBy?.fullName?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {chama.createdBy?.fullName || 'Unknown'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {chama.createdBy?.email || 'No email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(chama.status)}
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {chama.createdAt ? new Date(chama.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingId === chama._id ? (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button 
                                                        onClick={() => handleSaveEdit(chama._id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                                    >
                                                        <CheckIcon className="w-3 h-3 mr-1" />
                                                        Save
                                                    </button>
                                                    <button 
                                                        onClick={handleCancelEdit}
                                                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                    >
                                                        <XMarkIcon className="w-3 h-3 mr-1" />
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button 
                                                        onClick={() => handleEdit(chama)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                    >
                                                        <PencilIcon className="w-3 h-3 mr-1" />
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(chama._id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                    >
                                                        <TrashIcon className="w-3 h-3 mr-1" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function ManageChamasPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <ManageChamas />
        </ProtectedRoute>
    );
}