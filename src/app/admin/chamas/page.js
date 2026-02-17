'use client';
import { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon, CheckIcon, XMarkIcon, PlusIcon, MagnifyingGlassIcon, FunnelIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

function ManageChamas() {
    const [chamas, setChamas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({ name: '', description: '' });

    // Search & filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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

    // Filtered + searched chamas derived from state
    const filteredChamas = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return chamas.filter((chama) => {
            const matchesSearch =
                !q ||
                chama.name?.toLowerCase().includes(q) ||
                chama.createdBy?.fullName?.toLowerCase().includes(q) ||
                chama.createdBy?.email?.toLowerCase().includes(q);

            const matchesStatus =
                statusFilter === 'all' || chama.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [chamas, searchQuery, statusFilter]);

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
        if (window.confirm('Are you sure? This will delete the Chama and all its members permanently.')) {
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

    const handleClearSearch = () => {
        setSearchQuery('');
        setStatusFilter('all');
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            active: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            suspended: 'bg-red-100 text-red-800 border-red-200',
            inactive: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.inactive}`}>
                {status}
            </span>
        );
    };

    const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

    return (
        <div className="min-h-screen bg-gray-50 md:p-6 px-1 py-6">
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
                                {chamas.filter((c) => c.status === 'active').length}
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
                                {chamas.filter((c) => c.status === 'pending').length}
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
                                {chamas.filter((c) => c.status === 'suspended').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 className="text-lg font-medium text-gray-900">
                            All Chamas
                            {hasActiveFilters && (
                                <span className="ml-2 text-sm font-normal text-indigo-600">
                                    — {filteredChamas.length} of {chamas.length} shown
                                </span>
                            )}
                        </h3>

                        {/* Search & Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                            {/* Search Input */}
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or creator..."
                                    className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64 text-gray-800 placeholder-gray-400 bg-white"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Status Filter */}
                            <div className="relative flex items-center">
                                <FunnelIcon className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-800 bg-white appearance-none cursor-pointer"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearSearch}
                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    <XMarkIcon className="w-4 h-4 mr-1" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
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
                            ) : filteredChamas.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            {hasActiveFilters ? (
                                                <>
                                                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mb-4" />
                                                    <p className="text-lg font-medium text-gray-900">No results found</p>
                                                    <p className="text-sm text-gray-500 mb-4">
                                                        No Chamas match your search criteria.
                                                    </p>
                                                    <button
                                                        onClick={handleClearSearch}
                                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        Clear filters
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <PlusIcon className="h-12 w-12 text-gray-400 mb-4" />
                                                    <p className="text-lg font-medium text-gray-900">No Chamas found</p>
                                                    <p className="text-sm text-gray-500">Get started by creating your first Chama</p>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredChamas.map((chama) => (
                                    <tr key={chama._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingId === chama._id ? (
                                                <div className="space-y-2 grid grid-cols-1 md:grid-cols-1 gap-2">
                                                    <input
                                                        value={editFormData.name}
                                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                        className="block w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        placeholder="Chama name"
                                                    />
                                                    <textarea
                                                        value={editFormData.description}
                                                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                                        className="block text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        placeholder="Description"
                                                        rows="2"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        <HighlightedText text={chama.name} query={searchQuery} />
                                                    </div>
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
                                                        <HighlightedText text={chama.createdBy?.fullName || 'Unknown'} query={searchQuery} />
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        <HighlightedText text={chama.createdBy?.email || 'No email'} query={searchQuery} />
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

                                        <td className="px-6 py-4 whitespace-nowrap flex gap-2 text-right text-sm font-medium">
                                           
                                                                                        <Link
                                                                                            href={`/admin/chamas/${chama._id}`}
                                                                                            className="inline-flex items-center px-3 py-1.5 border border-indigo-200 text-xs font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                                                                        >
                                                                                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 mr-1" />
                                                                                            View Details
                                                                                        </Link>
                                                             
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

/**
 * Highlights matching text segments in a string based on a search query.
 */
function HighlightedText({ text, query }) {
    if (!query || !query.trim()) return <>{text}</>;

    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-100 text-yellow-900 rounded px-0.5">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
}

export default function ManageChamasPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <ManageChamas />
        </ProtectedRoute>
    );
}