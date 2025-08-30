// File Path: src/components/chama/EditChamaModal.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function EditChamaModal({ chama, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // When the modal opens or the chama data changes, reset the form
  useEffect(() => {
    if (chama) {
        // Deep copy to avoid mutating the original prop object
        const initialData = JSON.parse(JSON.stringify(chama));
        setFormData({
            name: initialData.name || '',
            description: initialData.description || '',
            contributionAmount: initialData.contributionAmount || '',
            contributionFrequency: initialData.contributionFrequency || 'monthly',
            equalSharing: initialData.equalSharing || {},
            rotationPayout: initialData.rotationPayout || {},
        });
    }
  }, [chama, isOpen]);

  if (!isOpen || !chama) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNestedChange = (group, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [group]: {
            ...prev[group],
            [name]: value
        }
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading('Saving changes...');
    try {
        const res = await fetch(`/api/chamas/${chama._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update Chama.');
        
        toast.success('Chama updated successfully!', { id: toastId });
        onUpdate(data.chama); // Pass updated data back to the parent
        onClose();
    } catch (error) {
        toast.error(error.message, { id: toastId });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Chama Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        
        <form onSubmit={handleSaveChanges} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
            {/* Basic Info */}
            <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Basic Information</legend>
                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-sm font-medium">Chama Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded mt-1" rows="3"></textarea>
                    </div>
                </div>
            </fieldset>

            {/* Financials */}
            <fieldset className="border p-4 rounded-md">
                <legend className="text-lg font-semibold px-2">Financials</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-sm font-medium">Contribution Amount (KES)</label>
                        <input type="number" name="contributionAmount" value={formData.contributionAmount} onChange={handleChange} className="w-full border p-2 rounded mt-1" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Contribution Frequency</label>
                        <select name="contributionFrequency" value={formData.contributionFrequency} onChange={handleChange} className="w-full border p-2 rounded mt-1">
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                        </select>
                    </div>
                </div>
            </fieldset>

            {/* --- TYPE-SPECIFIC SETTINGS --- */}

            {/* Equal Sharing Settings */}
            {chama.operationType === 'equal_sharing' && (
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">Equal Sharing Settings</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                         <div>
                            <label className="block text-sm font-medium">Savings Target (KES)</label>
                            <input type="number" name="targetAmount" value={formData.equalSharing.targetAmount || ''} onChange={(e) => handleNestedChange('equalSharing', e)} className="w-full border p-2 rounded mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Savings End Date</label>
                            <input type="date" name="savingEndDate" value={(formData.equalSharing.savingEndDate || '').split('T')[0]} onChange={(e) => handleNestedChange('equalSharing', e)} className="w-full border p-2 rounded mt-1" />
                        </div>
                    </div>
                </fieldset>
            )}
            
            {/* Rotation Payout Settings */}
            {chama.operationType === 'rotation_payout' && (
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">Rotation Payout Settings</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                         <div>
                            <label className="block text-sm font-medium">Payout Amount (KES)</label>
                            <input type="number" name="payoutAmount" value={formData.rotationPayout.payoutAmount || ''} onChange={(e) => handleNestedChange('rotationPayout', e)} className="w-full border p-2 rounded mt-1" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Payout Frequency</label>
                            <select name="payoutFrequency" value={formData.rotationPayout.payoutFrequency || 'monthly'} onChange={(e) => handleNestedChange('rotationPayout', e)} className="w-full border p-2 rounded mt-1">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">The order of member payouts is managed in the "Rotation" tab.</p>
                </fieldset>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold">Cancel</button>
                <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold disabled:bg-gray-400">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

