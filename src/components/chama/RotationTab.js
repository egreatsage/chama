'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function RotationTab({ chama, members, userRole, onRotationUpdate }) {
    const [isSaving, setIsSaving] = useState(false);

    // Creates a map of member data for easy lookup
    const memberMap = new Map(members.map(m => [m.userId._id.toString(), m.userId]));
    
    // The current order of user IDs from the database
    const rotationOrderIds = chama.rotationPayout?.rotationOrder || [];
    
    // The state for our draggable list, derived from the database order
    const [orderedMembers, setOrderedMembers] = useState(
        rotationOrderIds.map(userId => memberMap.get(userId.toString())).filter(Boolean)
    );

    const currentIndex = chama.rotationPayout?.currentRecipientIndex || 0;
    const currentRecipient = orderedMembers[currentIndex];

    // This function is called when a drag-and-drop action is completed
    const onDragEnd = (result) => {
        if (!result.destination) return; // Dropped outside the list

        const items = Array.from(orderedMembers);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setOrderedMembers(items); // Update the local state to show the new order
    };

    const handleSaveChanges = async (randomize = false) => {
        setIsSaving(true);
        const toastId = toast.loading('Saving new order...');

        // If randomizing, we use the original members list to create a new shuffled order
        // Otherwise, we use the manually reordered list from the state
        const memberUserIds = randomize 
            ? members.map(m => m.userId._id)
            : orderedMembers.map(m => m._id);

        try {
            const res = await fetch(`/api/chamas/${chama._id}/rotation`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rotationOrder: memberUserIds, randomize }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Rotation order saved!', { id: toastId });
            onRotationUpdate(); // Refresh data from the server
        } catch (err) {
            toast.error(err.message, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAdvanceRotation = async () => {
         if (!window.confirm("Are you sure you want to advance to the next member?")) return;
        setIsSaving(true);
        const toastId = toast.loading('Advancing rotation...');
        try {
             const res = await fetch(`/api/chamas/${chama._id}/rotation`, { method: 'POST' });
             const data = await res.json();
             if (!res.ok) throw new Error(data.error);
            toast.success('Rotation advanced!', { id: toastId });
            onRotationUpdate();
        } catch (err) {
             toast.error(err.message, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 hover:shadow-2xl transition-all duration-300">
            {/* Current Recipient Status */}
            <div className="mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-green-500 via-blue-500 to-red-500 p-0.5 rounded-xl">
                    <div className="bg-white rounded-xl p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                            Current Rotation Status
                        </h2>
                        {currentRecipient ? (
                            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 border-l-4 border-green-500">
                                <p className="text-lg sm:text-xl font-semibold text-gray-800">
                                    <span className="text-green-600">Current Recipient:</span>{' '}
                                    <span className="text-blue-600">{currentRecipient.firstName} {currentRecipient.lastName}</span>
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Position {currentIndex + 1} of {orderedMembers.length}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-lg p-4 border-l-4 border-red-500">
                                <p className="text-red-600 font-medium">No rotation order set up yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <hr className="my-6 sm:my-8 border-gray-300" />

            {/* Rotation Order Section */}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden sm:inline">Randomize & Save</span>
                            <span className="sm:hidden">Randomize</span>
                        </button>
                        
                        <button 
                            onClick={handleAdvanceRotation} 
                            disabled={isSaving} 
                            className="
                                bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 
                                text-white px-4 sm:px-6 py-3 rounded-xl text-sm font-semibold 
                                shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 
                                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                disabled:hover:scale-100 disabled:hover:shadow-lg
                                flex items-center justify-center space-x-2
                                sm:col-span-2 lg:col-span-1
                            "
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span className="hidden sm:inline">Advance to Next</span>
                            <span className="sm:hidden">Next</span>
                        </button>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="mt-6 bg-gray-100 rounded-xl p-4">
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
            
            {/* Loading Overlay */}
            {isSaving && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-2xl flex items-center justify-center z-10">
                    <div className="bg-white rounded-xl shadow-xl p-6 flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="text-gray-700 font-medium">Processing...</span>
                    </div>
                </div>
            )}
        </div>
    );
}