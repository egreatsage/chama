// File Path: src/components/chama/MembersList.js
'use client';

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
    MagnifyingGlassIcon, 
    UserPlusIcon, 
    XMarkIcon,
    UsersIcon 
} from '@heroicons/react/24/outline';

export default function MembersList({ members, chama, onActionComplete }) {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter members based on search query
    const filteredMembers = useMemo(() => {
        if (!searchQuery.trim()) return members;
        
        const query = searchQuery.toLowerCase().trim();
        return members.filter(member => {
            const fullName = `${member.userId?.firstName || ''} ${member.userId?.lastName || ''}`.toLowerCase();
            const email = member.userId?.email?.toLowerCase() || '';
            const role = member.role?.toLowerCase() || '';
            
            return fullName.includes(query) || 
                   email.includes(query) || 
                   role.includes(query);
        });
    }, [members, searchQuery]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        const toastId = toast.loading('Sending invite...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message, { id: toastId });
            setShowInviteModal(false);
            setInviteEmail('');
            onActionComplete(); // Refresh the member list in the parent component
        } catch (err) {
            toast.error(err.message, { id: toastId });
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = async (memberId) => {
        if (window.confirm("Are you sure you want to remove this member?")) {
            const toastId = toast.loading('Removing member...');
            try {
                const res = await fetch(`/api/chamas/${chama._id}/members`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ memberId }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                toast.success(data.message, { id: toastId });
                onActionComplete();
            } catch (err) {
                toast.error(err.message, { id: toastId });
            }
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
    };
    
    return (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Chama Members</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {members.length} member{members.length !== 1 ? 's' : ''} total
                            {searchQuery && (
                                <span className="ml-1">
                                    · {filteredMembers.length} matching "{searchQuery}"
                                </span>
                            )}
                        </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                        {chama.userRole === 'chairperson' && (
                            <button 
                                onClick={() => setShowInviteModal(true)} 
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <UserPlusIcon className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Invite Member</span>
                                <span className="sm:hidden">Invite</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mt-4 relative">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Search members by name, email, or role..."
                        />
                        {searchQuery && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <button
                                    onClick={clearSearch}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Members List */}
            <div className="divide-y divide-gray-200">
                {filteredMembers.length > 0 ? (
                    filteredMembers.map(member => (
                        <div key={member._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                {/* Member Info */}
                                <div className="flex items-center min-w-0 flex-1">
                                    <div className="flex-shrink-0">
                                        <img 
                                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover" 
                                            src={member.userId?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.userId?.firstName || '')}+${encodeURIComponent(member.userId?.lastName || '')}&background=random`} 
                                            alt={`${member.userId?.firstName} ${member.userId?.lastName}`}
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.userId?.firstName || '')}+${encodeURIComponent(member.userId?.lastName || '')}&background=random`;
                                            }}
                                        />
                                    </div>
                                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                                    {member.userId?.firstName} {member.userId?.lastName}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                    {member.userId?.email}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                    {member.userId?.phoneNumber}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Role and Actions */}
                                <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                            {member.role}
                                        </span>
                                        {chama.userRole === 'chairperson' && member.role !== 'chairperson' && (
                                            <button 
                                                onClick={() => handleRemove(member._id)} 
                                                className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium transition-colors mt-1 sm:mt-0"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // No results state
                    <div className="p-8 sm:p-12 text-center">
                        {searchQuery ? (
                            <div>
                                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-sm font-medium text-gray-900">No members found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    No members match your search for "{searchQuery}".
                                </p>
                                <button
                                    onClick={clearSearch}
                                    className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            <div>
                                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-sm font-medium text-gray-900">No members yet</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by inviting members to join this chama.
                                </p>
                                {chama.userRole === 'chairperson' && (
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <UserPlusIcon className="h-4 w-4 mr-2" />
                                        Invite first member
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Invite a New Member</h3>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input 
                                        id="invite-email"
                                        type="email" 
                                        value={inviteEmail} 
                                        onChange={(e) => setInviteEmail(e.target.value)} 
                                        placeholder="member@example.com" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        required 
                                    />
                                </div>
                                
                                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowInviteModal(false)} 
                                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isInviting} 
                                        className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isInviting ? 'Sending...' : 'Send Invite'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}