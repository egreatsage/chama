// File Path: src/components/chama/LoansTab.js
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
    XCircleIcon,
    DevicePhoneMobileIcon // Added for M-Pesa
} from '@heroicons/react/24/outline';
import { InformationCircleIcon } from '@heroicons/react/24/solid';

const formatCurrency = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

function LoanRow({ loan, userRole, handleLoanAction, currentUserId,onManualPayClick, onPayClick, isMobile = false }) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);
   
    const canTakeAction = ['chairperson', 'treasurer'].includes(userRole);
    const isMyLoan = loan.userId._id === currentUserId; 

    // Enhanced Calculations
    const totalExpected = loan.totalExpectedRepayment || loan.amount;
    const totalPaid = loan.totalPaid || 0;
    const penalty = loan.penaltyAmount || 0;
    const totalOwed = totalExpected + penalty;
    const outstandingBalance = totalOwed - totalPaid;
    const progressPercent = totalOwed > 0 ? Math.min(100, (totalPaid / totalOwed) * 100) : 0;

    const isOverdue = loan.status !== 'repaid' && loan.expectedRepaymentDate && new Date(loan.expectedRepaymentDate) < new Date();

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
        if (isOverdue && status !== 'repaid') return 'bg-red-50 text-red-700 border border-red-200';
        switch (status) {
            case 'approved': 
            case 'active': return 'bg-green-50 text-green-700 border border-green-200';
            case 'repaid': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'rejected': return 'bg-red-50 text-red-700 border border-red-200';
            case 'defaulted': return 'bg-purple-50 text-purple-700 border border-purple-200';
            default: return 'bg-amber-50 text-amber-700 border border-amber-200';
        }
    };

    const getStatusIcon = (status) => {
        if (isOverdue && status !== 'repaid') return <ExclamationTriangleIcon className="h-4 w-4" />;
        switch (status) {
            case 'approved': 
            case 'active': return <CheckCircleIcon className="h-4 w-4" />;
            case 'repaid': return <CurrencyDollarIcon className="h-4 w-4" />;
            case 'rejected': return <XCircleIcon className="h-4 w-4" />;
            case 'defaulted': return <ExclamationTriangleIcon className="h-4 w-4" />;
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
            <div className={`bg-white border ${isOverdue ? 'border-red-200' : 'border-gray-200'} rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1 min-w-0">
                        <div className="relative">
                            <img 
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100" 
                                src={loan.userId.photoUrl || `https://ui-avatars.com/api/?name=${loan.userId.firstName}+${loan.userId.lastName}&background=3b82f6&color=fff`} 
                                alt={`${loan.userId.firstName} ${loan.userId.lastName}`} 
                            />
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
                        <span className="ml-1">{isOverdue && loan.status !== 'repaid' ? 'Overdue' : loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</span>
                    </span>
                </div>

                {/* Amount - Highlighted with progress */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4 border border-gray-200">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Principal</p>
                            <p className="text-sm font-semibold text-gray-700">{formatCurrency(loan.amount)}</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-xs ${isOverdue ? 'text-red-600' : 'text-blue-600'} font-medium`}>Outstanding</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(outstandingBalance)}</p>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1 mt-2">
                        <div className={`h-2 rounded-full ${progressPercent >= 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>Paid: <span className='font-semibold'>{formatCurrency(totalPaid)}</span> / {formatCurrency(totalOwed)}</span>
                         <span className='font-semibold'>{progressPercent.toFixed(0)}%</span>
                    </div>
                     {penalty > 0 && <div className="text-right text-xs text-red-500 mt-1">Penalty: {formatCurrency(penalty)}</div>}
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
                <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                    <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1.5" />
                        <span>Req: {new Date(loan.createdAt).toLocaleDateString()}</span>
                    </div>
                    {loan.expectedRepaymentDate && (
                        <div className={`flex items-center ${isOverdue ? 'text-red-500' : 'text-gray-500'} font-medium`}>
                            <ClockIcon className="h-4 w-4 mr-1.5" />
                            Due: {new Date(loan.expectedRepaymentDate).toLocaleDateString()}
                        </div>
                    )}
                </div>

                {renderGuarantors()}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    {/* Admin Actions */}
                    {canTakeAction && loan.status === 'pending' && !isRejecting && (
                        <div className="flex space-x-2">
                            <button onClick={() => handleLoanAction(loan._id, 'approved')} className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700">
                                Approve
                            </button>
                            <button onClick={() => setIsRejecting(true)} className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700">
                                Reject
                            </button>
                        </div>
                    )}

                    {/* Borrower Action: Pay Installment */}
                    {isMyLoan && (loan.status === 'approved' || loan.status === 'active' || loan.status === 'defaulted') && (
                        <button 
                            onClick={() => onPayClick(loan)} 
                            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                        >
                            <DevicePhoneMobileIcon className="h-5 w-5 mr-1.5" />
                            Pay Installment via M-Pesa
                        </button>
                    )}

                    {/* Admin Override */}
                    {canTakeAction && (loan.status === 'approved' || loan.status === 'active' || loan.status === 'defaulted') && (
                    <button 
                       onClick={() => onManualPayClick(loan)} 
                        className="text-purple-600 hover:text-purple-900 text-xs ml-3 font-medium"
                        >
                         Record Offline Payment
                    </button>
                    )}
                </div>
            </div>
        );
    }

    // Desktop Table Row View
    return (
        <tr className={`hover:bg-gray-50 transition-colors duration-150 border-b ${isOverdue ? 'border-red-100' : 'border-gray-100'}`}>
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
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(loan.amount)}</span>
                    <span className="text-xs text-gray-500">Principal</span>
                    {penalty > 0 && <span className="text-xs text-red-500">+{formatCurrency(penalty)} Penalty</span>}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                 <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{formatCurrency(totalPaid)} / {formatCurrency(totalOwed)}</span>
                        <span className="font-semibold">{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${progressPercent >= 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 max-w-xs">
                <div className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{loan.reason}</div>
                {renderGuarantors()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col text-sm">
                    <span className="text-gray-500">Req: {new Date(loan.createdAt).toLocaleDateString()}</span>
                    {loan.expectedRepaymentDate && (
                        <span className={`${isOverdue ? 'text-red-500' : 'text-gray-500'} font-medium`}>
                            Due: {new Date(loan.expectedRepaymentDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1.5 inline-flex items-center text-xs font-semibold rounded-full ${getStatusBadge(loan.status)}`}>
                    {getStatusIcon(loan.status)}
                    <span className="ml-1.5">{isOverdue && loan.status !== 'repaid' ? 'Overdue' : loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</span>
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {/* Admin Actions */}
                {canTakeAction && loan.status === 'pending' && !isRejecting && (
                    <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleLoanAction(loan._id, 'approved')} className="text-green-600 hover:text-green-900">Approve</button>
                        <button onClick={() => setIsRejecting(true)} className="text-red-600 hover:text-red-900">Reject</button>
                    </div>
                )}
                
                {/* Borrower Actions */}
                {isMyLoan && (loan.status === 'approved' || loan.status === 'active' || loan.status === 'defaulted') && (
                    <button 
                        onClick={() => onPayClick(loan)} 
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                    >
                        <DevicePhoneMobileIcon className="h-4 w-4 mr-1" />
                        Pay Now
                    </button>
                )}

                {/* Admin Override */}
                {canTakeAction && (loan.status === 'approved' || loan.status === 'active') && !isMyLoan && (
                    <button onClick={() => handleLoanAction(loan._id, 'repaid')} className="text-blue-600 hover:text-blue-900 text-xs ml-3">
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

    // NEW: Payment Modal States
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentLoan, setPaymentLoan] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentPhone, setPaymentPhone] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    // NEW: Manual Payment Modal States
    const [isManualPayModalOpen, setIsManualPayModalOpen] = useState(false);
    const [manualPayLoan, setManualPayLoan] = useState(null);
    const [manualPayAmount, setManualPayAmount] = useState('');

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
    const openManualPayModal = (loan) => {
    setManualPayLoan(loan);
    const outstanding = loan.outstandingBalance ?? ((loan.totalExpectedRepayment || loan.amount) + (loan.penaltyAmount || 0) - (loan.totalPaid || 0));
    setManualPayAmount(outstanding.toString()); // Pre-fill with full outstanding balance (fixes the Mark Repaid issue)
    setIsManualPayModalOpen(true);
    };
    const handleManualPayment = async (e) => {
    e.preventDefault();
    if (!manualPayAmount || parseFloat(manualPayAmount) <= 0) return toast.error("Enter a valid amount");

    setIsSubmittingPayment(true);
    const toastId = toast.loading("Recording payment...");

    try {
        const res = await fetch(`/api/chamas/${chama._id}/loans/${manualPayLoan._id}/repay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: parseFloat(manualPayAmount),
                paymentMethod: 'cash' // Or bank transfer
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        toast.success("Payment recorded successfully!", { id: toastId });
        setIsManualPayModalOpen(false);
        fetchLoans(); // Refresh the table to show updated progress and status
    } catch (error) {
        toast.error(error.message, { id: toastId });
    } finally {
        setIsSubmittingPayment(false);
    }
};
    const handleRequestLoan = async (e) => {
        e.preventDefault();
        if (!newLoanAmount || parseFloat(newLoanAmount) <= 0) return toast.error('Enter a valid amount');
        if (!newLoanReason.trim()) return toast.error('Provide a reason');

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
            toast.success("Request submitted!", { id: toastId });
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
            toast.success(`Loan ${status}!`, { id: toastId });
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
            if (!res.ok) throw new Error("Action failed");
            toast.success(`Request ${status}!`, { id: toastId });
            fetchLoans();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    // NEW: Handle user clicking "Pay" on a specific loan
    const openPaymentModal = (loan) => {
        setPaymentLoan(loan);
        const outstanding = loan.outstandingBalance ?? ((loan.totalExpectedRepayment || loan.amount) + (loan.penaltyAmount || 0) - (loan.totalPaid || 0));
        setPaymentAmount(outstanding.toString()); // Default to full amount
        setIsPaymentModalOpen(true);
    };

    // NEW: Handle STK push submit
    const handleInitiatePayment = async (e) => {
        e.preventDefault();
        if (!paymentPhone || !paymentAmount) return toast.error("Phone and Amount required");

        setIsSubmittingPayment(true);
        const toastId = toast.loading("Initiating M-Pesa STK Push...");

        try {
            const res = await fetch('/api/mpesa/stkpush', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: paymentPhone,
                    amount: parseFloat(paymentAmount),
                    chamaId: chama._id,
                    paymentType: 'loan_repayment',
                    loanId: paymentLoan._id
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Payment failed to initiate");

            toast.success("Check your phone! Enter PIN to complete payment.", { id: toastId, duration: 6000 });
            setIsPaymentModalOpen(false);

            // --- NEW: Polling to check for updates ---
            const initialPaidAmount = paymentLoan.totalPaid || 0;
            let pollCount = 0;
            const maxPolls = 12; // Poll for 1 minute (12 * 5s)

            const pollInterval = setInterval(async () => {
                pollCount++;
                const freshLoansRes = await fetch(`/api/chamas/${chama._id}/loans`);
                const freshLoansData = await freshLoansRes.json();
                const updatedLoan = freshLoansData.loans.find(l => l._id === paymentLoan._id);

                if (updatedLoan && (updatedLoan.totalPaid > initialPaidAmount)) {
                    toast.success("Repayment received and updated!", {
                        icon: '🎉'
                    });
                    setLoans(freshLoansData.loans); // Update the state with all fresh loans
                    clearInterval(pollInterval);
                } else if (pollCount >= maxPolls) {
                    clearInterval(pollInterval);
                    toast.loading("Payment is processing in the background. It may take a moment to reflect.", { duration: 5000 });
                    fetchLoans(); // One final fetch
                }
            }, 5000); // Poll every 5 seconds
            // --- END NEW ---

        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const filteredLoans = loans.filter(loan => {
        if (filter === 'all') return true;
        // Map 'approved', 'active', 'defaulted' to an "active" filter mentally, or keep strict
        return loan.status === filter;
    });

    // ... [loanStats logic remains the same]
    const loanStats = {
        total: loans.length,
        pending: loans.filter(l => l.status === 'pending').length,
        approved: loans.filter(l => ['approved','active','defaulted'].includes(l.status)).length,
        repaid: loans.filter(l => l.status === 'repaid').length,
        rejected: loans.filter(l => l.status === 'rejected').length,
    };

    return (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center">
                            <CurrencyDollarIcon className="h-6 w-6 lg:h-7 lg:w-7 mr-3 text-white" />
                            Loan Management
                        </h2>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 transition-all shadow-lg"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Request Loan
                    </button>
                </div>
            </div>
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
            <div className="px-6 lg:px-8 py-6">
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
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Tables / Mobile view */}
            <div className="overflow-hidden">
                <div className="hidden md:block overflow-x-auto px-6 lg:px-8 pb-8">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-y border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Member</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Repayment Progress</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Timeline</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {!isLoading && filteredLoans.map(loan => (
                                <LoanRow 
                                    key={loan._id} 
                                    loan={loan} 
                                    userRole={userRole} 
                                    handleLoanAction={handleLoanAction} 
                                    currentUserId={currentUserId} 
                                    onPayClick={openPaymentModal}
                                    onManualPayClick={openManualPayModal}
                                    isMobile={false}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden px-4 pb-6 space-y-4">
                    {!isLoading && filteredLoans.map(loan => (
                        <LoanRow 
                            key={loan._id} 
                            loan={loan} 
                            userRole={userRole} 
                            handleLoanAction={handleLoanAction} 
                            currentUserId={currentUserId}
                            onPayClick={openPaymentModal}
                            onManualPayClick={openManualPayModal} 
                            isMobile={true}
                        />
                    ))}
                </div>
            </div>

            {/* --- NEW: M-Pesa Payment Modal --- */}
            {isPaymentModalOpen && paymentLoan && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-emerald-600 px-6 py-5">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <DevicePhoneMobileIcon className="h-6 w-6 mr-2" />
                                Pay Loan Installment
                            </h3>
                        </div>
                        <form onSubmit={handleInitiatePayment} className="p-6 space-y-5">
                            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm mb-4 border border-emerald-100">
                                Outstanding Balance: <span className="font-bold">{formatCurrency(
                                    paymentLoan.outstandingBalance ?? ((paymentLoan.totalExpectedRepayment || paymentLoan.amount) + (paymentLoan.penaltyAmount || 0) - (paymentLoan.totalPaid || 0))
                                )}</span>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount to Pay (KES)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={paymentAmount} 
                                    onChange={(e) => setPaymentAmount(e.target.value)} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                                    required 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">M-Pesa Phone Number</label>
                                <input 
                                    type="tel" 
                                    placeholder="e.g. 0712345678"
                                    value={paymentPhone} 
                                    onChange={(e) => setPaymentPhone(e.target.value)} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                                    required 
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
                                <button 
                                    type="button" 
                                    onClick={() => setIsPaymentModalOpen(false)} 
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmittingPayment}
                                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition flex items-center"
                                >
                                    {isSubmittingPayment ? 'Initiating...' : 'Send to Phone'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Original Request Loan Modal */}
               {/* --- Manual Payment Modal (For Admins) --- */}
{isManualPayModalOpen && manualPayLoan && (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-purple-600 px-6 py-5">
                <h3 className="text-xl font-bold text-white flex items-center">
                    <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                    Record Offline Repayment
                </h3>
                <p className="text-purple-100 text-sm mt-1">Record cash or direct bank transfers</p>
            </div>
            <form onSubmit={handleManualPayment} className="p-6 space-y-5">
                <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-sm mb-4 border border-purple-100">
                    Member: <span className="font-bold">{manualPayLoan.userId.firstName} {manualPayLoan.userId.lastName}</span><br/>
                    Outstanding Balance: <span className="font-bold">{formatCurrency(
                        manualPayLoan.outstandingBalance ?? ((manualPayLoan.totalExpectedRepayment || manualPayLoan.amount) + (manualPayLoan.penaltyAmount || 0) - (manualPayLoan.totalPaid || 0))
                    )}</span>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount Received (KES)</label>
                    <input 
                        type="number" 
                        min="1"
                        max={manualPayLoan.outstandingBalance ?? undefined}
                        step="0.01"
                        value={manualPayAmount} 
                        onChange={(e) => setManualPayAmount(e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" 
                        required 
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave as full amount to mark the loan as completely repaid.</p>
                </div>

                <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200">
                    <button 
                        type="button" 
                        onClick={() => setIsManualPayModalOpen(false)} 
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmittingPayment}
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition flex items-center"
                    >
                        {isSubmittingPayment ? 'Recording...' : 'Record Payment'}
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
            
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