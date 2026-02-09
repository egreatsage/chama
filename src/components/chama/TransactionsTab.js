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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 via-green-600 to-blue-700 px-6 py-5 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {transaction ? (
                                <>
                                    <PencilIcon className="h-6 w-6" />
                                    Edit Transaction
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="h-6 w-6" />
                                    Record New Transaction
                                </>
                            )}
                        </h3>
                        <button 
                            onClick={onClose} 
                            className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors duration-200"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Transaction Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Transaction Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, type: 'income'})} 
                                className={`px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-200 ${
                                    formData.type === 'income' 
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-600 text-white shadow-lg transform scale-105' 
                                        : 'bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50'
                                }`}
                            >
                                <ArrowUpCircleIcon className="h-5 w-5 inline-block mr-2" />
                                Income
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, type: 'expense'})} 
                                className={`px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-200 ${
                                    formData.type === 'expense' 
                                        ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-600 text-white shadow-lg transform scale-105' 
                                        : 'bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:bg-red-50'
                                }`}
                            >
                                <ArrowDownCircleIcon className="h-5 w-5 inline-block mr-2" />
                                Expense
                            </button>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                            Category
                        </label>
                        <input 
                            type="text" 
                            name="category" 
                            id="category" 
                            value={formData.category} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 bg-gradient-to-br from-blue-50 text-gray-900 to-green-50 border-2 border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                            placeholder="e.g., Bank Fees, Asset Sale, Contributions" 
                            required 
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                            Amount (KES)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-500 font-semibold">KES</span>
                            <input 
                                type="number" 
                                name="amount" 
                                id="amount" 
                                value={formData.amount} 
                                onChange={handleChange} 
                                className="w-full pl-16 pr-4 py-3  text-gray-900 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                                placeholder="1000.00" 
                                required 
                                min="0.01" 
                                step="0.01" 
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea 
                            name="description" 
                            id="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            rows={3} 
                            className="w-full px-4 py-3 bg-gradient-to-br from-blue-50 text-gray-900 to-green-50 border-2 border-blue-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none" 
                            placeholder="Optional details about the transaction"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-red-300 rounded-xl text-sm font-semibold text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 border border-transparent rounded-xl text-sm font-semibold text-white hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                'Save Transaction'
                            )}
                        </button>
                    </div>
                </form>
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
            fetchTransactions();
            onDataUpdate();
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
            fetchTransactions();
            onDataUpdate();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border-t-4 border-green-500">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 via-green-600 to-blue-700 px-4 sm:px-6 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-white">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Financial Ledger
                        </h2>
                        <p className="text-sm text-blue-100 mt-1">
                            A record of all income and expenses for the Chama
                        </p>
                    </div>
                    {canManage && (
                        <button 
                            onClick={handleAddClick} 
                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 font-semibold rounded-xl text-sm hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Transaction
                        </button>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                            <tr>
                                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-blue-700 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                                    Recorded By
                                </th>
                                {canManage && (
                                    <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-blue-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={canManage ? 6 : 5} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-gray-500 font-medium">Loading transactions...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={canManage ? 6 : 5} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-medium">No transactions recorded yet</p>
                                                <p className="text-sm text-gray-500 mt-1">Start by adding your first transaction</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-colors duration-150">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {new Date(tx.createdAt).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric' 
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                                                tx.type === 'income' 
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                            }`}>
                                                {tx.type === 'income' ? (
                                                    <ArrowUpCircleIcon className="h-4 w-4 mr-1" />
                                                ) : (
                                                    <ArrowDownCircleIcon className="h-4 w-4 mr-1" />
                                                )}
                                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="text-sm text-gray-900 font-semibold">{tx.category}</div>
                                            {tx.description && (
                                                <div className="text-xs text-gray-500 mt-1 line-clamp-1">{tx.description}</div>
                                            )}
                                        </td>
                                        <td className={`px-4 sm:px-6 py-4 whitespace-nowrap text-right ${
                                            tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            <div className="text-base font-bold">
                                                {formatCurrency(tx.amount)}
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-50 text-gray-9000 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {tx.recordedBy?.firstName?.charAt(0) || 'N'}
                                                </div>
                                                <span className="text-sm text-gray-700 font-medium">
                                                    {tx.recordedBy ? tx.recordedBy.firstName : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        {canManage && (
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEditClick(tx)} 
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                                        title="Edit transaction"
                                                    >
                                                        <PencilIcon className="h-5 w-5"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(tx._id)} 
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                                        title="Delete transaction"
                                                    >
                                                        <TrashIcon className="h-5 w-5"/>
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Footer */}
            {!isLoading && transactions.length > 0 && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 sm:px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                        <span className="text-gray-600 font-medium">
                            Total Transactions: <span className="text-blue-600 font-bold">{transactions.length}</span>
                        </span>
                        <div className="flex flex-wrap gap-4">
                            <span className="text-green-600 font-semibold">
                                Income: {formatCurrency(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
                            </span>
                            <span className="text-red-600 font-semibold">
                                Expenses: {formatCurrency(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
                            </span>
                        </div>
                    </div>
                </div>
            )}
            
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