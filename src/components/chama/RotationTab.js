'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, RefreshCw, UserCheck, CheckCircle, XCircle, History, FileDown, Zap, AlertTriangle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const formatCurrency = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

export default function RotationTab({ chama, members, userRole, onRotationUpdate, cycles = [] }) {
    const [isSaving, setIsSaving] = useState(false);
    const [contributionStatus, setContributionStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Build a map from userId string -> user object, handling both populated objects and plain IDs
    const memberMap = new Map(
        members.map(m => {
            const userObj = m.userId?._id ? m.userId : m.userId;
            const key = (userObj?._id || userObj)?.toString();
            return [key, userObj];
        })
    );

    const rotationOrderIds = chama.rotationPayout?.rotationOrder || [];

    // Derive the ordered list from the rotation IDs, falling back to the full members list
    // if the map lookup fails (e.g. IDs are plain strings not populated objects)
    const resolveOrderedMembers = () => {
        const resolved = rotationOrderIds
            .map(userId => memberMap.get(userId?.toString()))
            .filter(Boolean);
        // If map lookups all failed, fall back to members order so drag-and-drop still works
        if (resolved.length === 0 && members.length > 0) {
            return members.map(m => m.userId?._id ? m.userId : m.userId).filter(Boolean);
        }
        return resolved;
    };

    const [orderedMembers, setOrderedMembers] = useState(resolveOrderedMembers);

    const payoutHistory = cycles?.filter(c => c.cycleType === 'rotation_cycle');

    useEffect(() => {
        const fetchContributionStatus = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/chamas/${chama._id}/contribution-status`);
                if (res.ok) {
                    const statusData = await res.json();
                    setContributionStatus(statusData);
                } else {
                    toast.error("Could not load contribution status.");
                }
            } catch (error) {
                toast.error("Failed to load rotation data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchContributionStatus();
    }, [chama._id, onRotationUpdate]);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(orderedMembers);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setOrderedMembers(items);
    };

    const handleSaveChanges = async (randomize = false) => {
        setIsSaving(true);
        const toastId = toast.loading('Saving new order...');
        const memberUserIds = randomize ? members.map(m => m.userId._id) : orderedMembers.map(m => m._id);

        try {
            const res = await fetch(`/api/chamas/${chama._id}/rotation`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rotationOrder: memberUserIds, randomize }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Rotation order saved!', { id: toastId });
            onRotationUpdate();
        } catch (err) {
            toast.error(err.message, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExecutePayout = async () => {
        // Check for unpaid/partially paid members and warn accordingly
        const unpaidCount = contributionStatus?.stats?.unpaidMembers || 0;
        const partialCount = contributionStatus?.stats?.partiallyPaidMembers || 0;
        const totalUnpaid = unpaidCount + partialCount;

        if (totalUnpaid > 0) {
            const unpaidNames = contributionStatus?.memberStatuses
                ?.filter(({ status }) => status !== 'Paid')
                ?.map(({ memberInfo }) => `${memberInfo.firstName} ${memberInfo.lastName}`)
                ?.join(', ') || '';

            const warningMessage =
                `⚠️ WARNING: Not all members have fully paid!\n\n` +
                `• ${unpaidCount} unpaid member(s)\n` +
                `• ${partialCount} partially paid member(s)\n` +
                (unpaidNames ? `\nMembers with outstanding payments:\n${unpaidNames}\n` : '') +
                `\nThe payout will proceed using the current balance (${formatCurrency(chama.currentBalance)}).\n\n` +
                `Do you still want to proceed with the payout?`;

            if (!window.confirm(warningMessage)) return;
        } else {
            if (!window.confirm("Are you sure? This will execute the payout and advance to the next member.")) return;
        }

        setIsSaving(true);
        const toastId = toast.loading('Executing Payout...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}/rotation`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message, { id: toastId });
            onRotationUpdate();
        } catch (err) {
            toast.error(err.message, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const currentIndex = chama.rotationPayout?.currentRecipientIndex ?? 0;
    const currentRecipient = orderedMembers[currentIndex] ?? null;

    // Simplified: payout is possible if there's a recipient lined up and the balance
    // meets or exceeds the target. We no longer block on unpaid members — the confirm
    // dialog in handleExecutePayout handles that warning instead.
    const targetAmount = chama.rotationPayout?.targetAmount || 0;
    const canPayout = currentRecipient != null && (chama.currentBalance ?? 0) >= targetAmount;

    const unpaidOrPartialCount = (contributionStatus?.stats?.unpaidMembers || 0) + (contributionStatus?.stats?.partiallyPaidMembers || 0);
    const hasUnpaidMembers = unpaidOrPartialCount > 0;

    const isNewRotation = currentIndex === 0 && payoutHistory.length >= members.length;

    console.log({ contributionStatus, payoutHistory, currentIndex, isNewRotation, currentRecipient, canPayout });

    // Chart data preparation
    const contributionChartData = [
        { name: 'Paid', value: contributionStatus?.stats?.paidMembers || 0 },
        { name: 'Unpaid', value: (contributionStatus?.stats?.unpaidMembers || 0) + (contributionStatus?.stats?.partiallyPaidMembers || 0) },
    ];
    const COLORS = ['#10B981', '#EF4444'];

    const historyChartData = payoutHistory
        .map(cycle => ({
            name: `${cycle.recipientId?.firstName || 'Unknown'}`,
            'Payout Amount': cycle.actualAmount,
        }))
        .reverse();

    const generateHistoryExcel = () => {
        if (!payoutHistory || payoutHistory.length === 0) {
            toast.error("No payout history to export.");
            return;
        }

        const excelData = payoutHistory.map(cycle => ({
            'Date': new Date(cycle.endDate).toLocaleDateString(),
            'Recipient': `${cycle.recipientId?.firstName || 'Unknown'} ${cycle.recipientId?.lastName || 'Member'}`,
            'Amount': cycle.actualAmount,
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        worksheet['!cols'] = [
            { wch: 15 },
            { wch: 25 },
            { wch: 15 },
        ];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rotation History');

        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `${chama.name}_rotation_history_${currentDate}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300 relative">
            {/* New Rotation Alert */}
            {isNewRotation && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Zap className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-800">
                                A new full rotation has begun! The cycle starts again with the first member.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Unpaid Members Warning Banner */}
            {hasUnpaidMembers && userRole === 'chairperson' && (
                <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-orange-800">
                                {unpaidOrPartialCount} member(s) have not fully paid this period.
                            </p>
                            <p className="text-xs text-orange-700 mt-1">
                                You can still execute the payout, but you will be prompted to confirm. The payout will use the current available balance.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left Column: Status and Order */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Current Status Section */}
                    <div>
                        <div className="bg-gradient-to-r from-green-500 via-blue-500 to-red-500 p-0.5 rounded-xl">
                            <div className="bg-white rounded-xl p-4 sm:p-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                                    Current Rotation Status
                                </h2>

                                {currentRecipient ? (
                                    <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 border-l-4 border-green-500 mb-4">
                                        <div className="flex items-center">
                                            <UserCheck className="h-8 w-8 text-green-600 mr-4"/>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Current Recipient</p>
                                                <p className="text-lg sm:text-xl font-semibold text-blue-600">
                                                    {currentRecipient.firstName} {currentRecipient.lastName}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Position {currentIndex + 1} of {orderedMembers.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-lg p-4 border-l-4 border-red-500 mb-4">
                                        <p className="text-red-600 font-medium">No rotation order set up yet</p>
                                    </div>
                                )}

                                {/* Contribution Status */}
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                        Current Period Contribution Status
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Payout can be executed even if some members have not fully paid — a confirmation will be required.
                                    </p>

                                    <div className="grid gap-2">
                                        {isLoading ? (
                                            <div className="bg-gray-100 rounded-lg p-4">
                                                <div className="animate-pulse flex items-center space-x-3">
                                                    <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            contributionStatus?.memberStatuses.map(({ memberInfo, status }) => (
                                                <div key={memberInfo._id} className="flex items-center justify-between text-sm p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                                                    <span className="font-medium text-gray-800">
                                                        {memberInfo.firstName} {memberInfo.lastName}
                                                    </span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                            status === 'Paid'
                                                                ? 'bg-green-100 text-green-700'
                                                                : status === 'Partial'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {status}
                                                        </span>
                                                        {status === 'Paid' ?
                                                            <CheckCircle className="w-5 h-5 text-green-500" /> :
                                                            status === 'Partial' ?
                                                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> :
                                                            <XCircle className="w-5 h-5 text-red-500" />
                                                        }
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rotation Order Management */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            Rotation Order
                        </h3>

                        {userRole === 'chairperson' ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                    <p className="text-sm text-blue-700 font-medium">
                                        💡 Drag and drop members to reorder the rotation sequence
                                    </p>
                                </div>

                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="members">
                                        {(provided, snapshot) => (
                                            <ol
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`space-y-2 sm:space-y-3 transition-colors duration-200 ${
                                                    snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                                                }`}
                                            >
                                                {orderedMembers.map((member, index) => (
                                                    <Draggable key={member._id} draggableId={member._id.toString()} index={index}>
                                                        {(provided, snapshot) => (
                                                            <li
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`
                                                                    p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 cursor-grab active:cursor-grabbing
                                                                    ${index === currentIndex
                                                                        ? 'bg-gradient-to-r from-green-100 via-blue-100 to-green-100 border-green-400 shadow-lg font-bold text-green-800 transform scale-105'
                                                                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                                                                    }
                                                                    ${snapshot.isDragging ? 'shadow-2xl transform rotate-2 scale-105 border-blue-500' : ''}
                                                                `}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className={`
                                                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                                                                            ${index === currentIndex
                                                                                ? 'bg-gradient-to-r from-green-500 to-blue-500'
                                                                                : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                                                            }
                                                                        `}>
                                                                            {index + 1}
                                                                        </div>
                                                                        <div>
                                                                            <p className={`font-semibold ${index === currentIndex ? 'text-green-800' : 'text-gray-800'}`}>
                                                                                {member.firstName} {member.lastName}
                                                                            </p>
                                                                            {index === currentIndex && (
                                                                                <p className="text-xs text-green-600 font-medium">
                                                                                    🎯 Current Recipient
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-gray-400">
                                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </ol>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {orderedMembers.map((member, index) => (
                                    <div
                                        key={member._id}
                                        className={`
                                            p-3 sm:p-4 rounded-xl border-2 transition-all duration-300
                                            ${index === currentIndex
                                                ? 'bg-gradient-to-r from-green-100 via-blue-100 to-green-100 border-green-400 shadow-lg font-bold text-green-800'
                                                : 'bg-white border-gray-200'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                                                ${index === currentIndex
                                                    ? 'bg-gradient-to-r from-green-500 to-blue-500'
                                                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                                }
                                            `}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${index === currentIndex ? 'text-green-800' : 'text-gray-800'}`}>
                                                    {member.firstName} {member.lastName}
                                                </p>
                                                {index === currentIndex && (
                                                    <p className="text-xs text-green-600 font-medium">
                                                        🎯 Current Recipient
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {userRole === 'chairperson' && (
                        <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                                <button
                                    onClick={() => handleSaveChanges(false)}
                                    disabled={isSaving}
                                    className="
                                        bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                                        text-white px-4 sm:px-6 py-3 rounded-xl text-sm font-semibold
                                        shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
                                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                        disabled:hover:scale-100 disabled:hover:shadow-lg
                                        flex items-center justify-center space-x-2
                                    "
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="hidden sm:inline">Save Manual Order</span>
                                    <span className="sm:hidden">Save Order</span>
                                </button>

                                <button
                                    onClick={() => handleSaveChanges(true)}
                                    disabled={isSaving}
                                    className="
                                        bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700
                                        text-white px-4 sm:px-6 py-3 rounded-xl text-sm font-semibold
                                        shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
                                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                        disabled:hover:scale-100 disabled:hover:shadow-lg
                                        flex items-center justify-center space-x-2
                                    "
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span className="hidden sm:inline">Randomize & Save</span>
                                    <span className="sm:hidden">Randomize</span>
                                </button>

                                <button
                                    onClick={handleExecutePayout}
                                    disabled={isSaving || !canPayout}
                                    className={`
                                        px-4 sm:px-6 py-3 rounded-xl text-sm font-semibold
                                        shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
                                        transition-all duration-200
                                        flex items-center justify-center space-x-2
                                        sm:col-span-2 lg:col-span-1
                                        ${!canPayout || isSaving
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed hover:scale-100 hover:shadow-lg'
                                            : hasUnpaidMembers
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                                        }
                                    `}
                                    title={
                                        !canPayout
                                            ? `Insufficient balance. Need ${formatCurrency(targetAmount)}, have ${formatCurrency(chama.currentBalance ?? 0)}`
                                            : hasUnpaidMembers
                                            ? `${unpaidOrPartialCount} member(s) have not fully paid — confirmation required`
                                            : 'Execute payout for current recipient'
                                    }
                                >
                                    {hasUnpaidMembers && canPayout
                                        ? <AlertTriangle className="w-4 h-4" />
                                        : <ArrowRight className="w-4 h-4" />
                                    }
                                    <span className="hidden sm:inline">Execute Payout</span>
                                    <span className="sm:hidden">Execute</span>
                                </button>
                            </div>

                            {/* Payout Button Status Info */}
                            {!canPayout && currentRecipient && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center space-x-2">
                                    <XCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>
                                        Insufficient balance for payout. Current balance: <strong>{formatCurrency(chama.currentBalance ?? 0)}</strong> — Target: <strong>{formatCurrency(targetAmount)}</strong>
                                    </span>
                                </div>
                            )}

                            {hasUnpaidMembers && canPayout && (
                                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700 flex items-center space-x-2">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <span>
                                        <strong>{unpaidOrPartialCount} member(s)</strong> have not fully paid. Payout is available but will require confirmation.
                                    </span>
                                </div>
                            )}

                            {/* Progress Indicator */}
                            <div className="bg-gray-100 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600">Rotation Progress</span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {currentIndex + 1} / {orderedMembers.length}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-red-400 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${((currentIndex + 1) / orderedMembers.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Charts */}
                <div className="space-y-6 sm:space-y-8">
                    {/* Contribution Chart */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Current Period Contributions</h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={contributionChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={60}
                                        fill="#8884d8"
                                    >
                                        {contributionChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Payout History Chart */}
                    <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Payout History</h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={historyChartData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                                    <YAxis type="category" dataKey="name" width={80} />
                                    <Tooltip formatter={(value) => formatCurrency(value)}/>
                                    <Legend />
                                    <Bar dataKey="Payout Amount" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payout History Table Section */}
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                        <History className="w-5 h-5 mr-2 text-green-500" />
                        Payout History
                    </h3>
                    <button
                        onClick={generateHistoryExcel}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <FileDown className="h-4 w-4 mr-2" />
                        Export History
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Recipient</th>
                                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="3" className="text-center py-8">
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                                <span className="text-gray-500">Loading history...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : payoutHistory?.length > 0 ? (
                                    payoutHistory.map(cycle => (
                                        <tr key={cycle._id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {new Date(cycle.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                                {cycle.recipientId?.firstName || 'Unknown'} {cycle.recipientId?.lastName || 'Member'}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm font-bold text-green-600">
                                                {formatCurrency(cycle.actualAmount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-8 text-gray-500">
                                            No payout history available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}