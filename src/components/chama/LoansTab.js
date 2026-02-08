'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
    PlusIcon, 
    CheckIcon, 
    XMarkIcon, 
    CurrencyDollarIcon,
    CalendarIcon,
    UserIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon

} from '@heroicons/react/24/outline';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

const formatCurrency = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

function LoanRow({ loan, userRole, handleLoanAction, currentUserId, isMobile = false }) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
   

    const canTakeAction = ['chairperson', 'treasurer'].includes(userRole);

    const handleRejectClick = () => {
        if (isRejecting) {
            if (!rejectionReason.trim()) {
                toast.error('Please provide a reason for rejection');
                return;
            }
            handleLoanAction(loan._id, 'rejected', rejectionReason);
            setIsRejecting(false);
            setRejectionReason('');
        } else {
            setIsRejecting(true);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border border-green-200';
            case 'repaid': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return '✅';
            case 'repaid': return '💰';
            case 'rejected': return '❌';
            default: return '⏳';
        }
    };
    const renderGuarantors = () => {
        if (!loan.guarantors || loan.guarantors.length === 0) return null;
        return (
            <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium">Guarantors:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                    {loan.guarantors.map((g, idx) => (
                        <span key={idx} className={`px-2 py-0.5 rounded-full border ${
                            g.status === 'accepted' ? 'bg-green-50 border-green-200 text-green-700' :
                            g.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                            'bg-yellow-50 border-yellow-200 text-yellow-700'
                        }`}>
                            {g.userId?.firstName} {g.userId?.lastName} ({g.status})
                        </span>
                    ))}
                </div>
            </div>
        );
    };
  

    // Mobile Card View
    if (isMobile) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                {renderGuarantors()}
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <img 
                            className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-100" 
                            src={loan.userId.photoUrl || `https://ui-avatars.com/api/?name=${loan.userId.firstName}+${loan.userId.lastName}&background=3b82f6&color=fff`} 
                            alt={`${loan.userId.firstName} ${loan.userId.lastName}`} 
                        />
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900">
                                {loan.userId.firstName} {loan.userId.lastName}
                            </p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 inline-flex items-center text-xs leading-4 font-semibold rounded-full ${getStatusBadge(loan.status)}`}>
                        <span className="mr-1">{getStatusIcon(loan.status)}</span>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                </div>

                {/* Amount */}
                <div className="flex items-center mb-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(loan.amount)}</span>
                </div>

                {/* Reason */}
                <div className="flex items-start mb-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{loan.reason}</p>
                </div>

                {/* Date */}
                <div className="flex items-center mb-3">
                    <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">{new Date(loan.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                {canTakeAction && loan.status === 'pending' && !isRejecting && (
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => handleLoanAction(loan._id, 'approved')} 
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                        >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Approve
                        </button>
                        <button 
                            onClick={() => setIsRejecting(true)} 
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                        >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Reject
                        </button>
                    </div>
                )}
                {isRejecting && (
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection"
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <div className="flex space-x-2">
                            <button 
                                onClick={handleRejectClick} 
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                            >
                                <CheckIcon className="h-4 w-4 mr-1"/>
                                Confirm Reject
                            </button>
                            <button 
                                onClick={() => {
                                    setIsRejecting(false);
                                    setRejectionReason('');
                                }} 
                                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {canTakeAction && loan.status === 'approved' && (
                    <button 
                        onClick={() => handleLoanAction(loan._id, 'repaid')} 
                        className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        Mark as Repaid
                    </button>
                )}
            </div>
        );
    }

    // Desktop Table Row View
    return (
        <tr className="hover:bg-gray-50 transition-colors duration-200">
            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img 
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-100" 
                            src={loan.userId.photoUrl || `https://ui-avatars.com/api/?name=${loan.userId.firstName}+${loan.userId.lastName}&background=3b82f6&color=fff`} 
                            alt={`${loan.userId.firstName} ${loan.userId.lastName}`} 
                        />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                            {loan.userId.firstName} {loan.userId.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                            Member
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(loan.amount)}</span>
                </div>
            </td>

            <td className="px-4 lg:px-6 py-4 max-w-xs">
                <p className="text-sm text-gray-700 line-clamp-2">{loan.reason}</p>
            </td>
            <td className="px-4 lg:px-6 py-4 max-w-xs">
                <p className="text-sm text-gray-700 line-clamp-2">{loan.reason}</p>
                {/* ADD THIS HERE */}
                {renderGuarantors()}
            </td>
            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(loan.createdAt).toLocaleDateString()}
                </div>
            </td>
            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusBadge(loan.status)}`}>
                    <span className="mr-1">{getStatusIcon(loan.status)}</span>
                    {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </span>
            </td>
            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {canTakeAction && loan.status === 'pending' && !isRejecting && (
                    <div className="flex items-center justify-end space-x-2">
                        <button 
                            onClick={() => handleLoanAction(loan._id, 'approved')} 
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                        >
                            <CheckIcon className="h-3 w-3 mr-1" />
                            Approve
                        </button>
                        <button 
                            onClick={() => setIsRejecting(true)} 
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                        >
                            <XMarkIcon className="h-3 w-3 mr-1" />
                            Reject
                        </button>
                    </div>
                )}
                {isRejecting && (
                    <div className="flex items-center space-x-2 min-w-0">
                        <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection"
                            className="flex-1 min-w-0 p-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <button 
                            onClick={handleRejectClick} 
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="Confirm rejection"
                        >
                            <CheckIcon className="w-4 h-4"/>
                        </button>
                        <button 
                            onClick={() => {
                                setIsRejecting(false);
                                setRejectionReason('');
                            }} 
                            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Cancel"
                        >
                            <XMarkIcon className="w-4 h-4"/>
                        </button>
                    </div>
                )}
                {canTakeAction && loan.status === 'approved' && (
                    <button 
                        onClick={() => handleLoanAction(loan._id, 'repaid')} 
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                        <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                        Mark Repaid
                    </button>
                )}
            </td>
        </tr>
    );
}

export default function LoansTab({ chama, userRole, currentUserId }) {
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLoanAmount, setNewLoanAmount] = useState('');
    const [newLoanReason, setNewLoanReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [members, setMembers] = useState([]);
    const [selectedGuarantors, setSelectedGuarantors] = useState([]);

    const fetchLoans = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chamas/${chama._id}/loans`);
            if (!res.ok) throw new Error("Failed to fetch loans");
            const data = await res.json();
            setLoans(data.loans);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (chama?._id) {
            fetchLoans();
        }
    }, [chama?._id]);

    const fetchMembers = async () => {
        try {
            const res = await fetch(`/api/chamas/${chama._id}/members`);
            if (res.ok) {
                const data = await res.json();
                // Filter out the current user (you can't guarantee yourself)
                setMembers(data.members.filter(m => m.userId._id !== currentUserId));
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
    };

    // Update useEffect to fetch members when modal opens or component mounts
    useEffect(() => {
        if (chama?._id) {
            fetchLoans();
            fetchMembers(); // Fetch members too
        }
    }, [chama?._id]);

    const handleRequestLoan = async (e) => {
        e.preventDefault();
        
        if (!newLoanAmount || parseFloat(newLoanAmount) <= 0) {
            toast.error('Please enter a valid loan amount');
            return;
        }
        
        if (!newLoanReason.trim()) {
            toast.error('Please provide a reason for the loan');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Submitting loan request...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}/loans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(newLoanAmount), reason: newLoanReason.trim(),guarantors: selectedGuarantors}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Loan request submitted successfully!", { id: toastId });
            setIsModalOpen(false);
            setNewLoanAmount('');
            setNewLoanReason('');
            fetchLoans();
            setSelectedGuarantors([]);
        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };
    const myGuaranteeRequests = loans.filter(loan => 
    loan.guarantors?.some(g => g.userId._id === currentUserId && g.status === 'pending') &&
    loan.status === 'pending'
);
    
    const handleLoanAction = async (loanId, status, rejectionReason = '') => {
        const toastId = toast.loading('Processing...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}/loans/${loanId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, rejectionReason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(`Loan ${status} successfully!`, { id: toastId });
            fetchLoans();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const filteredLoans = loans.filter(loan => {
        if (filter === 'all') return true;
        return loan.status === filter;
    });

    const loanStats = {
        total: loans.length,
        pending: loans.filter(l => l.status === 'pending').length,
        approved: loans.filter(l => l.status === 'approved').length,
        repaid: loans.filter(l => l.status === 'repaid').length,
        rejected: loans.filter(l => l.status === 'rejected').length,
        totalAmount: loans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
        approvedAmount: loans.filter(l => l.status === 'approved' || l.status === 'repaid')
                          .reduce((sum, loan) => sum + (loan.amount || 0), 0)
    };
    const handleGuarantorAction = async (loanId, status) => {
    const toastId = toast.loading(`Processing ${status}...`);
    try {
        const res = await fetch(`/api/chamas/${chama._id}/loans/${loanId}/guarantee`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Action failed");
        
        toast.success(`Request ${status} successfully!`, { id: toastId });
        fetchLoans(); // Refresh the list to remove the item
    } catch (error) {
        toast.error(error.message, { id: toastId });
    }
};
    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                            <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                            Loan Management
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">Manage member loan requests and payments</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-200 shadow-sm"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Request Loan
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6 bg-gray-50 border-b">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">{loanStats.total}</div>
                    <div className="text-sm text-gray-600">Total Loans</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-700">{loanStats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-green-200">
                    <div className="text-2xl font-bold text-green-700">{loanStats.approved}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">{formatCurrency(loanStats.approvedAmount)}</div>
                    <div className="text-sm text-gray-600">Total Approved</div>
                </div>
              
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex">
                            <div className="flex-shrink-0">
                                <InformationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                 </div>
                                   <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                       Approved loans are subtracted from the total chama balance. Ensure sufficient funds before approving new loans.
                                    </p>
                                </div>
                            </div>
                    </div>

            {/* Filters */}
            <div className="p-4 sm:p-6 border-b bg-white">
                  <div>
                    {/* GUARANTOR REQUESTS SECTION */}
{myGuaranteeRequests.length > 0 && (
    <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
            <span className="bg-yellow-200 text-yellow-800 py-1 px-2 rounded text-xs mr-2">Action Required</span>
            Guarantor Requests ({myGuaranteeRequests.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myGuaranteeRequests.map((loan) => (
                <div key={loan._id} className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100">
                    <div className="flex items-center mb-3">
                        <img 
                            src={loan.userId.photoUrl || "https://ui-avatars.com/api/?name=User"} 
                            className="w-10 h-10 rounded-full mr-3" 
                        />
                        <div>
                            <p className="font-semibold text-gray-900">{loan.userId.firstName} {loan.userId.lastName}</p>
                            <p className="text-xs text-gray-500">is asking for your guarantee</p>
                        </div>
                    </div>
                    
                    <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <div className="flex justify-between mb-1">
                            <span>Amount:</span>
                            <span className="font-bold text-gray-900">{formatCurrency(loan.amount)}</span>
                        </div>
                        <p className="italic">"{loan.reason}"</p>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleGuarantorAction(loan._id, 'accepted')}
                            className="flex-1 bg-green-600 text-white text-sm py-2 rounded hover:bg-green-700 transition"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleGuarantorAction(loan._id, 'rejected')}
                            className="flex-1 bg-red-100 text-red-700 text-sm py-2 rounded hover:bg-red-200 transition"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
)}
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'approved', 'repaid', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                                filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            {status !== 'all' && (
                                <span className="ml-1 bg-white bg-opacity-20 px-1 rounded">
                                    {status === 'pending' ? loanStats.pending :
                                     status === 'approved' ? loanStats.approved :
                                     status === 'repaid' ? loanStats.repaid :
                                     status === 'rejected' ? loanStats.rejected : loanStats.total}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Table/Cards */}
            <div className="overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <UserIcon className="h-4 w-4 mr-1" />
                                        Member
                                    </div>
                                </th>
                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                        Amount
                                    </div>
                                </th>
                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                                        Reason
                                    </div>
                                </th>
                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" />
                                        Date
                                    </div>
                                </th>
                                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-4 lg:px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="ml-2 text-gray-600">Loading loans...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLoans.length > 0 ? (
                                filteredLoans.map(loan => (
                                    <LoanRow 
                                        key={loan._id} 
                                        loan={loan} 
                                        userRole={userRole} 
                                        handleLoanAction={handleLoanAction} 
                                        currentUserId={currentUserId} 
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-8">
                                        <div className="flex flex-col items-center">
                                            <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mb-3" />
                                            <p className="text-gray-500">No loan requests found.</p>
                                            <p className="text-sm text-gray-400">
                                                {filter !== 'all' ? `No ${filter} loans to display.` : 'Be the first to request a loan!'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                {/* Mobile Cards */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600">Loading loans...</span>
                            </div>
                        </div>
                    ) : filteredLoans.length > 0 ? (
                        <div className="p-4 space-y-4">
                            {filteredLoans.map(loan => (
                                <LoanRow 
                                    key={loan._id} 
                                    loan={loan} 
                                    userRole={userRole} 
                                    handleLoanAction={handleLoanAction} 
                                    currentUserId={currentUserId}
                                    isMobile={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="flex flex-col items-center">
                                <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mb-3" />
                                <p className="text-gray-500">No loan requests found.</p>
                                <p className="text-sm text-gray-400">
                                    {filter !== 'all' ? `No ${filter} loans to display.` : 'Be the first to request a loan!'}
                                </p>
                            </div>
                        </div>
                    )}
            </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
                            <h3 className="text-lg font-semibold text-white">New Loan Request</h3>
                            <p className="text-blue-100 text-sm">Submit your loan request for approval</p>
                        </div>
                        <form onSubmit={handleRequestLoan} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loan Amount (KES) *
                                </label>
                                <div className="relative">
                                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input 
                                        type="number" 
                                        min="1"
                                        step="0.01"
                                        value={newLoanAmount} 
                                        onChange={(e) => setNewLoanAmount(e.target.value)} 
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                                        placeholder="Enter amount"
                                        required 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason for Loan *
                                </label>
                                <textarea 
                                    value={newLoanReason} 
                                    onChange={(e) => setNewLoanReason(e.target.value)} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                                    rows={3}
                                    placeholder="Explain why you need this loan"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Guarantors (Optional)
                                </label>
                                <select 
                                    multiple
                                    value={selectedGuarantors}
                                    onChange={(e) => {
                                        const options = [...e.target.selectedOptions];
                                        const values = options.map(option => option.value);
                                        setSelectedGuarantors(values);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 h-32" 
                                >
                                    {members.map((member) => (
                                        <option key={member.userId._id} value={member.userId._id}>
                                            {member.userId.firstName} {member.userId.lastName}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Hold Ctrl (Cmd on Mac) to select multiple</p>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}