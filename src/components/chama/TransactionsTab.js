// File Path: src/components/chama/TransactionsTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownCircleIcon, ArrowUpCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useAuthStore from '@/store/authStore';

const formatCurrency = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

// Reusable Modal Component
const TransactionModal = ({ isOpen, onClose, onSubmit, transaction, isSubmitting }) => {
    const [formData, setFormData] = useState({
        type: 'expense',
        category: '',
        amount: '',
        description: ''
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                type: transaction.type,
                category: transaction.category,
                amount: transaction.amount,
                description: transaction.description || ''
            });
        } else {
            setFormData({ type: 'expense', category: '', amount: '', description: '' });
        }
    }, [transaction, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {transaction ? 'Edit Transaction' : 'Record New Transaction'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <div className="mt-1 grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`px-4 py-2 text-sm rounded-md border ${formData.type === 'income' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white hover:bg-gray-50'}`}>Income</button>
                                <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`px-4 py-2 text-sm rounded-md border ${formData.type === 'expense' ? 'bg-red-100 border-red-300 text-red-800' : 'bg-white hover:bg-gray-50'}`}>Expense</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="e.g., Bank Fees, Asset Sale" required />
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (KES)</label>
                            <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="1000" required min="0.01" step="0.01" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Optional details about the transaction"></textarea>
                        </div>
                        <div className="pt-4 flex justify-end space-x-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300">
                                {isSubmitting ? 'Saving...' : 'Save Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


export default function TransactionsTab({ chama, userRole, onDataUpdate }) {
    const { user } = useAuthStore();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const canManage = ['chairperson', 'treasurer'].includes(userRole);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chamas/${chama._id}/transactions`);
            if (!res.ok) throw new Error("Failed to fetch transactions");
            const data = await res.json();
            setTransactions(data.transactions);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (chama?._id) {
            fetchTransactions();
        }
    }, [chama?._id]);
    
    const handleAddClick = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };
    
    const handleEditClick = (transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = async (transactionId) => {
        if (!window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) return;

        const toastId = toast.loading('Deleting transaction...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}/transactions/${transactionId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete transaction');
            }
            toast.success('Transaction deleted successfully!', { id: toastId });
            fetchTransactions(); // Refresh list
            onDataUpdate(); // Update parent component data (e.g., balance)
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true);
        const toastId = toast.loading(editingTransaction ? 'Updating transaction...' : 'Adding transaction...');
        
        const isEditing = !!editingTransaction;
        const url = isEditing
            ? `/api/chamas/${chama._id}/transactions/${editingTransaction._id}`
            : `/api/chamas/${chama._id}/transactions`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(`Transaction ${isEditing ? 'updated' : 'added'} successfully!`, { id: toastId });
            setIsModalOpen(false);
            fetchTransactions(); // Refresh list
            onDataUpdate(); // Update parent component data
        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Financial Ledger</h2>
                    <p className="text-sm text-gray-500">A record of all income and expenses for the Chama.</p>
                </div>
                {canManage && (
                    <button onClick={handleAddClick} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Transaction
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded By</th>
                            {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={canManage ? 6 : 5} className="text-center py-10 text-gray-500">Loading transactions...</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={canManage ? 6 : 5} className="text-center py-10 text-gray-500">No transactions recorded yet.</td></tr>
                        ) : (
                            transactions.map(tx => (
                                <tr key={tx._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {tx.type === 'income' ? <ArrowUpCircleIcon className="h-4 w-4 mr-1" /> : <ArrowDownCircleIcon className="h-4 w-4 mr-1" />}
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{tx.category}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(tx.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.recordedBy ? `${tx.recordedBy.firstName}` : 'N/A'}</td>
                                    {canManage && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleEditClick(tx)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5"/></button>
                                            <button onClick={() => handleDelete(tx._id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                transaction={editingTransaction}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
