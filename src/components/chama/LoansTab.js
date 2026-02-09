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
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
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
            case 'approved': return 'bg-green-50 text-green-700 border border-green-200';
            case 'repaid': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'rejected': return 'bg-red-50 text-red-700 border border-red-200';
            default: return 'bg-amber-50 text-amber-700 border border-amber-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
            case 'repaid': return <CurrencyDollarIcon className="h-4 w-4" />;
            case 'rejected': return <XCircleIcon className="h-4 w-4" />;
            default: return <ClockIcon className="h-4 w-4" />;
        }
    };

    const renderGuarantors = () => {
        if (!loan.guarantors || loan.guarantors.length === 0) return null;
        return (
            <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center mb-2">
                    <ShieldCheckIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-xs font-medium text-gray-600">Guarantors</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {loan.guarantors.map((g, idx) => (
                        <span key={idx} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            g.status === 'accepted' ? 'bg-green-50 border border-green-200 text-green-700' :
                            g.status === 'rejected' ? 'bg-red-50 border border-red-200 text-red-700' :
                            'bg-amber-50 border border-amber-200 text-amber-700'
                        }`}>
                            {g.status === 'accepted' && <CheckIcon className="h-3 w-3 mr-1" />}
                            {g.status === 'rejected' && <XMarkIcon className="h-3 w-3 mr-1" />}
                            {g.status === 'pending' && <ClockIcon className="h-3 w-3 mr-1" />}
                            {g.userId?.firstName} {g.userId?.lastName}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    // Mobile Card View
    if (isMobile) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1 min-w-0">
                        <div className="relative">
                            <img 
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100" 
                                src={loan.userId.photoUrl || `https://ui-avatars.com/api/?name=${loan.userId.firstName}+${loan.userId.lastName}&background=3b82f6&color=fff`} 
                                alt={`${loan.userId.firstName} ${loan.userId.lastName}`} 
                            />
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                <UserIcon className="h-3 w-3 text-gray-400" />
                            </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {loan.userId.firstName} {loan.userId.lastName}
                            </p>
                            <p className="text-xs text-gray-500">Member</p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(loan.status)} ml-2`}>
                        {getStatusIcon(loan.status)}
                        <span className="ml-1">{loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</span>
                    </span>
                </div>

                {/* Amount - Highlighted */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="bg-green-100 rounded-full p-2">
                                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs text-gray-600 mb-0.5">Loan Amount</p>
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(loan.amount)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reason */}
                <div className="mb-4">
                    <div className="flex items-start">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Reason</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{loan.reason}</p>
                        </div>
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-center mb-4 text-xs text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1.5" />
                    <span>Requested on {new Date(loan.createdAt).toLocaleDateString('en-KE', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>

                {/* Guarantors */}
                {renderGuarantors()}

                {/* Actions */}
                {canTakeAction && loan.status === 'pending' && !isRejecting && (
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                        <button 
                            onClick={() => handleLoanAction(loan._id, 'approved')} 
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
                        >
                            <CheckIcon className="h-4 w-4 mr-1.5" />
                            Approve
                        </button>
                        <button 
                            onClick={() => setIsRejecting(true)} 
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm"
                        >
                            <XMarkIcon className="h-4 w-4 mr-1.5" />
                            Reject
                        </button>
                    </div>
                )}
                {isRejecting && (
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                        <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection"
                            className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        />
                        <div className="flex space-x-2">
                            <button 
                                onClick={handleRejectClick} 
                                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200"
                            >
                                <CheckIcon className="h-4 w-4 mr-1.5"/>
                                Confirm Reject
                            </button>
                            <button 
                                onClick={() => {
                                    setIsRejecting(false);
                                    setRejectionReason('');
                                }} 
                                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-gray-800 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {canTakeAction && loan.status === 'approved' && (
                    <button 
                        onClick={() => handleLoanAction(loan._id, 'repaid')} 
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 mt-4 pt-4 border-t border-gray-100 shadow-sm"
                    >
                        <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                        Mark as Repaid
                    </button>
                )}
            </div>
        );
    }

    // Desktop Table Row View
    return (
        <tr className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 relative">
                        <img 
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100" 
                            src={loan.userId.photoUrl || `https://ui-avatars.com/api/?name=${loan.userId.firstName}+${loan.userId.lastName}&background=3b82f6&color=fff`} 
                            alt={`${loan.userId.firstName} ${loan.userId.lastName}`} 
                        />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                            {loan.userId.firstName} {loan.userId.lastName}
                        </div>
                        <div className="text-xs text-gray-500">Member</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="inline-flex items-center bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-1.5" />
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(loan.amount)}</span>
                </div>
            </td>
            <td className="px-6 py-4 max-w-xs">
                <div className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{loan.reason}</div>
                {renderGuarantors()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    {new Date(loan.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1.5 inline-flex items-center text-xs font-semibold rounded-full ${getStatusBadge(loan.status)}`}>
                    {getStatusIcon(loan.status)}
                    <span className="ml-1.5">{loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</span>
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {canTakeAction && loan.status === 'pending' && !isRejecting && (
                    <div className="flex items-center justify-end space-x-2">
                        <button 
                            onClick={() => handleLoanAction(loan._id, 'approved')} 
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-sm"
                        >
                            <CheckIcon className="h-3.5 w-3.5 mr-1" />
                            Approve
                        </button>
                        <button 
                            onClick={() => setIsRejecting(true)} 
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-sm"
                        >
                            <XMarkIcon className="h-3.5 w-3.5 mr-1" />
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
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 text-gray-800 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                        <button 
                            onClick={handleRejectClick} 
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all"
                            title="Confirm rejection"
                        >
                            <CheckIcon className="w-4 h-4"/>
                        </button>
                        <button 
                            onClick={() => {
                                setIsRejecting(false);
                                setRejectionReason('');
                            }} 
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                            title="Cancel"
                        >
                            <XMarkIcon className="w-4 h-4"/>
                        </button>
                    </div>
                )}
                {canTakeAction && loan.status === 'approved' && (
                    <button 
                        onClick={() => handleLoanAction(loan._id, 'repaid')} 
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm"
                    >
                        <CurrencyDollarIcon className="h-3.5 w-3.5 mr-1" />
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

    const fetchMembers = async () => {
        try {
            const res = await fetch(`/api/chamas/${chama._id}/members`);
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members.filter(m => m.userId._id !== currentUserId));
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
    };

    useEffect(() => {
        if (chama?._id) {
            fetchLoans();
            fetchMembers();
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
                body: JSON.stringify({ 
                    amount: parseFloat(newLoanAmount), 
                    reason: newLoanReason.trim(),
                    guarantors: selectedGuarantors
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Loan request submitted successfully!", { id: toastId });
            setIsModalOpen(false);
            setNewLoanAmount('');
            setNewLoanReason('');
            setSelectedGuarantors([]);
            fetchLoans();
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

    return (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center">
                            <div className="bg-white bg-opacity-20 rounded-lg p-2 mr-3">
                                <CurrencyDollarIcon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                            </div>
                            Loan Management
                        </h2>
                        <p className="text-blue-100 text-sm mt-2">Track and manage member loan requests</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Request Loan
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="bg-blue-100 rounded-lg p-2">
                            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">{loanStats.total}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Loans</div>
                </div>
                
                <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-amber-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="bg-amber-100 rounded-lg p-2">
                            <ClockIcon className="h-5 w-5 text-amber-600" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-amber-700">{loanStats.pending}</div>
                    <div className="text-sm text-gray-600 mt-1">Pending</div>
                </div>
                
                <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="bg-green-100 rounded-lg p-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-green-700">{loanStats.approved}</div>
                    <div className="text-sm text-gray-600 mt-1">Approved</div>
                </div>
                
                <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-blue-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="bg-blue-100 rounded-lg p-2">
                            <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-xl lg:text-2xl font-bold text-blue-700">{formatCurrency(loanStats.approvedAmount)}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Approved</div>
                </div>
            </div>

            {/* Important Notice */}
            <div className="px-6 lg:px-8 pb-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl shadow-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <InformationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800 leading-relaxed">
                                <span className="font-semibold">Important:</span> Approved loans are subtracted from the total chama balance. Ensure sufficient funds before approving new loans.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guarantor Requests Section */}
            {myGuaranteeRequests.length > 0 && (
                <div className="px-6 lg:px-8 pb-6">
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5 lg:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-amber-900 flex items-center">
                                <div className="bg-amber-200 text-amber-900 py-1 px-3 rounded-lg text-xs font-bold mr-3">
                                    ACTION REQUIRED
                                </div>
                                Guarantor Requests
                            </h3>
                            <span className="bg-amber-200 text-amber-900 py-1 px-3 rounded-full text-xs font-bold">
                                {myGuaranteeRequests.length}
                            </span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {myGuaranteeRequests.map((loan) => (
                                <div key={loan._id} className="bg-white p-5 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center mb-4">
                                        <img 
                                            src={loan.userId.photoUrl || `https://ui-avatars.com/api/?name=${loan.userId.firstName}+${loan.userId.lastName}`} 
                                            className="w-12 h-12 rounded-full ring-2 ring-amber-100 mr-3" 
                                            alt="User"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-900">{loan.userId.firstName} {loan.userId.lastName}</p>
                                            <p className="text-xs text-gray-500">Requesting your guarantee</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4 text-sm bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Amount:</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(loan.amount)}</span>
                                        </div>
                                        <p className="text-gray-700 italic text-xs leading-relaxed">"{loan.reason}"</p>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleGuarantorAction(loan._id, 'accepted')}
                                            className="flex-1 bg-green-600 text-white text-sm py-2.5 rounded-lg hover:bg-green-700 transition-all font-medium shadow-sm"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleGuarantorAction(loan._id, 'rejected')}
                                            className="flex-1 bg-red-50 text-red-700 text-sm py-2.5 rounded-lg hover:bg-red-100 transition-all font-medium border border-red-200"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="px-6 lg:px-8 pb-6">
                <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'approved', 'repaid', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                filter === status
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            {status !== 'all' && (
                                <span className={`ml-2 ${filter === status ? 'bg-white bg-opacity-20' : 'bg-gray-200'} px-2 py-0.5 rounded-full text-xs`}>
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
                <div className="hidden md:block overflow-x-auto px-6 lg:px-8 pb-8">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-y border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                                        Member
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-500" />
                                        Amount
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-500" />
                                        Reason & Guarantors
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                                        Date
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-4">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                                            <span className="text-gray-600">Loading loans...</span>
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
                                    <td colSpan="6" className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-gray-100 rounded-full p-4 mb-4">
                                                <ExclamationTriangleIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <p className="text-gray-600 font-medium mb-1">No loan requests found</p>
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
                <div className="md:hidden px-4 pb-6">
                    {isLoading ? (
                        <div className="py-12 text-center">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
                                <span className="text-gray-600">Loading loans...</span>
                            </div>
                        </div>
                    ) : filteredLoans.length > 0 ? (
                        <div className="space-y-4">
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
                        <div className="py-12 text-center">
                            <div className="flex flex-col items-center">
                                <div className="bg-gray-100 rounded-full p-4 mb-4">
                                    <ExclamationTriangleIcon className="h-12 w-12 text-gray-400" />
                                </div>
                                <p className="text-gray-600 font-medium mb-1">No loan requests found</p>
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
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                                New Loan Request
                            </h3>
                            <p className="text-blue-100 text-sm mt-1">Submit your loan request for approval</p>
                        </div>
                        <form onSubmit={handleRequestLoan} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Loan Amount (KES) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        type="number" 
                                        min="1"
                                        step="0.01"
                                        value={newLoanAmount} 
                                        onChange={(e) => setNewLoanAmount(e.target.value)} 
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                        placeholder="Enter amount"
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for Loan *
                                </label>
                                <textarea 
                                    value={newLoanReason} 
                                    onChange={(e) => setNewLoanReason(e.target.value)} 
                                    className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                    rows={4}
                                    placeholder="Explain why you need this loan"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                    className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-32" 
                                >
                                    {members.map((member) => (
                                        <option key={member.userId._id} value={member.userId._id} className="py-2">
                                            {member.userId.firstName} {member.userId.lastName}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                    <InformationCircleIcon className="h-4 w-4 mr-1" />
                                    Hold Ctrl (Cmd on Mac) to select multiple members
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setNewLoanAmount('');
                                        setNewLoanReason('');
                                        setSelectedGuarantors([]);
                                    }} 
                                    className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-800 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="h-4 w-4 mr-2" />
                                            Submit Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}