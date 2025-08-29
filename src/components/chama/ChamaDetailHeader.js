// File Path: src/components/chama/ChamaDetailHeader.js
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ChamaDetailHeader({ chama, setChama }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: chama.name, description: chama.description });

    const handleSave = async () => {
        const toastId = toast.loading('Saving...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setChama({ ...chama, ...data.chama }); // Update parent state
            toast.success('Chama updated!', { id: toastId });
            setIsEditing(false);
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };
    
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              {isEditing ? (
                  <div className="flex-grow space-y-4">
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full text-3xl font-bold text-gray-900 border-b-2 pb-1" />
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full text-gray-600 mt-2 border rounded p-2" rows="3" />
                  </div>
              ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{chama.name}</h1>
                    <p className="text-gray-600 mt-2">{chama.description}</p>
                  </div>
              )}
            
              {chama.userRole === 'chairperson' && (
                  <div className="ml-4 flex-shrink-0">
                    {isEditing ? (
                        <div className="flex space-x-2"><button onClick={handleSave} className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm">Save</button><button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm">Cancel</button></div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-white text-gray-700 px-3 py-1 border rounded-md text-sm">Edit</button>
                    )}
                  </div>
              )}
            </div>
        </div>
    );
}
