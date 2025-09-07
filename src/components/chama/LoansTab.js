// File Path: src/components/chama/LoansTab.js
'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import { PlusIcon, CheckIcon, XIcon } from 'lucide-react';

const formatCurrency = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

export default function LoansTab({ chama, userRole }) {
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user: currentUser } = useAuthStore();

    const fetchLoans = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chamas/${chama._id}/loans`);
            if (!res.ok) throw new Error('Failed to fetch loans');
            const data = await res.json();
            setLoans(data.loans);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, [chama._id]);

    const handleLoanAction = async (loanId, status, rejectionReason = '') => {
        const toastId = toast.loading(`Updating loan to ${status}...`);
        try {
            const res = await fetch(`/api/chamas/${chama._id}/loans/${loanId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, rejectionReason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update loan');
            toast.success(`Loan successfully ${status}.`, { id: toastId });
            fetchLoans(); // Refresh data
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const isAdmin = ['chairperson', 'treasurer'].includes(userRole);

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Loan Requests</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" /> Request Loan
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {isAdmin && <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Member</th>}
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                {isAdmin && <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-6">Loading loans...</td></tr>
                            ) : loans.length === 0 ? (
                                <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-6 text-gray-500">No loan requests yet.</td></tr>
                            ) : (
                                loans.map(loan => (
                                    <LoanRow key={loan._id} loan={loan} isAdmin={isAdmin} onAction={handleLoanAction} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <RequestLoanModal chama={chama} onClose={() => setIsModalOpen(false)} onLoanRequested={fetchLoans} />}
        </div>
    );
}

function LoanRow({ loan, isAdmin, onAction }) {
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            repaid: 'bg-blue-100 text-blue-800',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    const handleConfirmReject = () => {
        onAction(loan._id, 'rejected', rejectionReason);
        setIsRejecting(false);
    };

    return (
        <tr>
            {isAdmin && <td className="px-4 py-4 whitespace-nowrap">{loan.userId.firstName} {loan.userId.lastName}</td>}
            <td className="px-4 py-4 whitespace-nowrap font-medium">{formatCurrency(loan.amount)}</td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate">{loan.reason}</td>
            <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(loan.status)}</td>
            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(loan.createdAt).toLocaleDateString()}</td>
            {isAdmin && (
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                    {loan.status === 'pending' && !isRejecting && (
                        <div className="flex justify-center space-x-2">
                            <button onClick={() => onAction(loan._id, 'approved')} className="p-1 text-green-600 hover:text-green-900"><CheckIcon className="w-5 h-5"/></button>
                            <button onClick={() => setIsRejecting(true)} className="p-1 text-red-600 hover:text-red-900"><XIcon className="w-5 h-5"/></button>
                        </div>
                    )}
                    {loan.status === 'pending' && isRejecting && (
                        <div className="flex items-center space-x-1">
                            <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Reason (optional)"
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-xs"
                            />
                            <button onClick={handleConfirmReject} className="p-1 text-green-600 hover:text-green-900"><CheckIcon className="w-5 h-5"/></button>
                            <button onClick={() => setIsRejecting(false)} className="p-1 text-gray-500 hover:text-gray-700"><XIcon className="w-5 h-5"/></button>
                        </div>
                    )}
                    {loan.status === 'approved' && (
                        <button onClick={() => onAction(loan._id, 'repaid')} className="text-blue-600 hover:text-blue-900 text-xs font-semibold">Mark as Repaid</button>
                    )}
                </td>
            )}
        </tr>
    );
}

function RequestLoanModal({ chama, onClose, onLoanRequested }) {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/chamas/${chama._id}/loans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, reason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to request loan');
            toast.success("Loan request submitted successfully!");
            onLoanRequested();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-medium mb-4">Request a Loan</h3>
                <p className="text-sm text-gray-600 mb-4">Chama Balance: <span className="font-bold">{formatCurrency(chama.currentBalance)}</span></p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Amount (KES)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-2 rounded mt-1" required max={chama.currentBalance} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Reason for Loan</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full border p-2 rounded mt-1" rows="3" required />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

