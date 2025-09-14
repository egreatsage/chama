// File Path: src/components/chama/RotationTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, RefreshCw, UserCheck, CheckCircle, XCircle, History, FileDown, Zap } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const formatCurrency = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

export default function RotationTab({ chama, members, userRole, onRotationUpdate }) {
    // ... (all existing state and handlers remain the same)
    const [isSaving, setIsSaving] = useState(false);
    const [contributionStatus, setContributionStatus] = useState(null);
    const [payoutHistory, setPayoutHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const memberMap = new Map(members.map(m => [m.userId._id.toString(), m.userId]));
    const rotationOrderIds = chama.rotationPayout?.rotationOrder || [];
    const [orderedMembers, setOrderedMembers] = useState(
        rotationOrderIds.map(userId => memberMap.get(userId.toString())).filter(Boolean)
    );

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [statusRes, historyRes] = await Promise.all([
                    fetch(`/api/chamas/${chama._id}/contribution-status`),
                    fetch(`/api/chamas/${chama._id}/cycles`)
                ]);

                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    setContributionStatus(statusData);
                } else {
                    toast.error("Could not load contribution status.");
                }

                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    setPayoutHistory(historyData.cycles?.filter(c => c.cycleType === 'rotation_cycle'));
                } else {
                    toast.error("Could not load payout history.");
                }
            } catch (error) {
                toast.error("Failed to load rotation data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
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
        const memberUserIds = randomize ? members.map(m => m.userId._id) : orderedMembers.map(m => m.userId._id);

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
        if (!window.confirm("Are you sure? This will execute the payout and advance to the next member.")) return;
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
    
    const currentIndex = chama.rotationPayout?.currentRecipientIndex || 0;
    const currentRecipient = orderedMembers[currentIndex];
    const allMembersPaid = contributionStatus?.stats?.unpaidMembers === 0 && contributionStatus?.stats?.partiallyPaidMembers === 0;
    const isNewRotation = currentIndex === 0 && payoutHistory.length >= members.length;


    // ... (chart data preparation remains the same)
    const contributionChartData = [
        { name: 'Paid', value: contributionStatus?.stats?.paidMembers || 0 },
        { name: 'Unpaid', value: (contributionStatus?.stats?.unpaidMembers || 0) + (contributionStatus?.stats?.partiallyPaidMembers || 0) },
    ];
    const COLORS = ['#10B981', '#EF4444'];

    const historyChartData = payoutHistory
    .map(cycle => ({
        name: `${memberMap.get(cycle.recipientId.toString())?.firstName || 'Unknown'}`,
        'Payout Amount': cycle.actualAmount,
    }))
    .reverse();

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Status and Order */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Current Rotation Status</h2>
                        {currentRecipient ? (
                             <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 border-l-4 border-green-500">
                                <div className="flex items-center">
                                    <UserCheck className="h-8 w-8 text-green-600 mr-4"/>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Current Recipient</p>
                                        <p className="text-lg font-semibold text-blue-600">{currentRecipient.firstName} {currentRecipient.lastName}</p>
                                        <p className="text-sm text-gray-600">Position {currentIndex + 1} of {orderedMembers.length}</p>
                                    </div>
                                </div>
                            </div>
                        ) : <p className="text-red-600">No rotation order set.</p>}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Rotation Order</h3>
                         {userRole === 'chairperson' ? (
                            <div className="space-y-4">
                               <p className="text-sm text-blue-700 font-medium bg-blue-50 p-3 rounded-lg">💡 Drag and drop members to reorder the rotation sequence.</p>
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="members">
                                        {(provided) => (
                                            <ol {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                                {orderedMembers.map((member, index) => (
                                                    <Draggable key={member.userId._id} draggableId={member.userId._id.toString()} index={index}>
                                                        {(provided) => (
                                                            <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`p-3 rounded-lg border flex justify-between items-center cursor-grab ${index === currentIndex ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
                                                                <span className={`font-bold mr-2 ${index === currentIndex ? 'text-green-700' : 'text-gray-600'}`}>{index + 1}. {member.firstName} {member.lastName}</span>
                                                                {index === currentIndex && <span className="text-xs font-bold text-green-700">CURRENT</span>}
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
                             <ol className="space-y-2">
                                {orderedMembers.map((member, index) => (
                                    <li key={member.userId._id} className={`p-3 rounded-lg border ${index === currentIndex ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
                                        <span className={`font-bold mr-2 ${index === currentIndex ? 'text-green-700' : 'text-gray-600'}`}>{index + 1}.</span>
                                        {member.firstName} {member.lastName}
                                        {index === currentIndex && <span className="text-xs font-bold text-green-700 ml-2"> (Current)</span>}
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                     {userRole === 'chairperson' && (
                        <div className="mt-6 pt-6 border-t">
                             <div className="flex flex-wrap gap-2">
                                <button onClick={() => handleSaveChanges(false)} disabled={isSaving} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold">Save Order</button>
                                <button onClick={() => handleSaveChanges(true)} disabled={isSaving} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-semibold">Randomize</button>
                                <button onClick={handleExecutePayout} disabled={isSaving || !allMembersPaid} className="w-full mt-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold disabled:bg-gray-400">Execute Payout</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Charts */}
                <div className="space-y-8">
                     <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Period Contributions</h3>
                         <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={contributionChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                                     {contributionChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                     ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payout History</h3>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={historyChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
    );
}
