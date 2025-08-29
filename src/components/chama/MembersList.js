// File Path: src/components/chama/MembersList.js
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function MembersList({ members, chama, onActionComplete }) {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);

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
    
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Chama Members</h2>
                {chama.userRole === 'chairperson' && (
                    <button onClick={() => setShowInviteModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold">+ Invite Member</button>
                )}
            </div>
            <ul className="divide-y divide-gray-200">
                {members.map(member => (
                    <li key={member._id} className="py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-full" src={member.userId?.photoUrl || `https://ui-avatars.com/api/?name=${member.userId?.firstName}+${member.userId?.lastName}`} alt="" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{member.userId?.firstName} {member.userId?.lastName}</p>
                                <p className="text-sm text-gray-500">{member.userId?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-600 capitalize">{member.role}</span>
                            {chama.userRole === 'chairperson' && member.role !== 'chairperson' && (
                                <button onClick={() => handleRemove(member._id)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Remove</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {showInviteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Invite a New Member</h3>
                        <form onSubmit={handleInvite}>
                            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Enter member's email" className="w-full border p-2 rounded mb-4" required />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowInviteModal(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Cancel</button>
                                <button type="submit" disabled={isInviting} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50">{isInviting ? 'Sending...' : 'Send Invite'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
