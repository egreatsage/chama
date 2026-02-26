'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Save, Settings, DollarSign, Calendar, Users, RotateCcw } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-lg p-2 mr-4">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Edit Chama Details</h2>
                <p className="text-blue-100 mt-1">Update your group's information and settings</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSaveChanges} className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 rounded-lg p-2 mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chama Name *
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name || ''} 
                    onChange={handleChange} 
                    className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg transition-all duration-200 text-gray-800 placeholder-gray-400"
                    placeholder="Enter your Chama name"
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description || ''} 
                    onChange={handleChange} 
                    className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                    placeholder="Describe your Chama's purpose and goals"
                    rows="4"
                  />
                </div>
              </div>
            </div>

            {/* Financial Settings Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 rounded-lg p-2 mr-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Financial Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contribution Amount (KES) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">KES</span>
                    <input 
                      type="number" 
                      name="contributionAmount" 
                      value={formData.contributionAmount || ''} 
                      onChange={handleChange} 
                      className="w-full border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 p-3 pl-12 rounded-lg transition-all duration-200 text-gray-800"
                      placeholder="5000"
                      min="1"
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <select
                    name="contributionFrequency"
                    value={formData.contributionFrequency || 'monthly'}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Type-Specific Settings */}
            {chama.operationType === 'equal_sharing' && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-100 rounded-lg p-2 mr-3">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Equal Sharing Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Savings Target (KES)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">KES</span>
                      <input 
                        type="number" 
                        name="targetAmount" 
                        value={formData.equalSharing?.targetAmount || ''} 
                        onChange={(e) => handleNestedChange('equalSharing', e)} 
                        className="w-full border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 pl-12 rounded-lg transition-all duration-200 text-gray-800"
                        placeholder="50000"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Savings End Date
                    </label>
                    <input 
                      type="date" 
                      name="savingEndDate" 
                      value={(formData.equalSharing?.savingEndDate || '').split('T')[0]} 
                      onChange={(e) => handleNestedChange('equalSharing', e)} 
                      className="w-full border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all duration-200 text-gray-800"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {chama.operationType === 'rotation_payout' && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-100 rounded-lg p-2 mr-3">
                    <RotateCcw className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Rotation Payout Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payout Amount (KES) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">KES</span>
                      <input 
                        type="number" 
                        name="payoutAmount" 
                        value={formData.rotationPayout?.payoutAmount || ''} 
                        onChange={(e) => handleNestedChange('rotationPayout', e)} 
                        className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-3 pl-12 rounded-lg transition-all duration-200 text-gray-800"
                        placeholder="10000"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payout Frequency *
                    </label>
                    <select 
                      name="payoutFrequency" 
                      value={formData.rotationPayout?.payoutFrequency || 'monthly'} 
                      onChange={(e) => handleNestedChange('rotationPayout', e)} 
                      className="w-full border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 p-3 rounded-lg transition-all duration-200 text-gray-800 bg-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-purple-100/50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 flex items-center">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    The order of member payouts is managed in the "Rotation" tab.
                  </p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="bg-gray-50 rounded-xl p-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 focus:ring-2 focus:ring-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100 focus:ring-2 focus:ring-blue-200"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving Changes...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Save className="h-5 w-5 mr-2" />
                      Save Changes
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}