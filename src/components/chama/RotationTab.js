// File Path: src/components/chama/RotationTab.js
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
        <div className="bg-white shadow rounded-lg p-6">
            {/* ... Status display remains the same ... */}
            <hr className="my-6" />

            <h3 className="text-lg font-semibold mb-2">Rotation Order</h3>
            {userRole === 'chairperson' ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="members">
                        {(provided) => (
                            <ol {...provided.droppableProps} ref={provided.innerRef} className="list-decimal list-inside space-y-2">
                                {orderedMembers.map((member, index) => (
                                    <Draggable key={member._id} draggableId={member._id.toString()} index={index}>
                                        {(provided) => (
                                            <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`p-2 rounded border ${index === currentIndex ? 'bg-indigo-100 font-bold' : 'bg-gray-50'}`}
                                            >
                                                {index + 1}. {member.firstName} {member.lastName}
                                            </li>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ol>
                        )}
                    </Droppable>
                </DragDropContext>
            ) : (
                <ol className="list-decimal list-inside space-y-2">
                    {/* Non-chairpersons see a static list */}
                </ol>
            )}

            {userRole === 'chairperson' && (
                <div className="mt-6 border-t pt-6 flex flex-wrap gap-2">
                    <button onClick={() => handleSaveChanges(false)} disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold">Save Manual Order</button>
                    <button onClick={() => handleSaveChanges(true)} disabled={isSaving} className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-semibold">Randomize and Save</button>
                    <button onClick={handleAdvanceRotation} disabled={isSaving} className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold ml-auto">Advance to Next</button>
                </div>
            )}
        </div>
    );
}

