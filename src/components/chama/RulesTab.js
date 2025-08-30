// File Path: src/components/chama/RulesTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheckIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function RulesTab({ chama, userRole }) {
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/chamas/${chama._id}/rules`);
        if (!res.ok) throw new Error('Failed to load rules');
        const data = await res.json();
        setRules(data.rules);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (chama._id) {
      fetchRules();
    }
  }, [chama._id]);
  
  const handleToggle = (path) => {
    const keys = path.split('.');
    setRules(prev => {
        const newRules = { ...prev };
        let current = newRules;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = !current[keys[keys.length - 1]];
        return newRules;
    });
  };
  
  const handleChange = (path, value) => {
    const keys = path.split('.');
    setRules(prev => {
        const newRules = { ...prev };
        let current = newRules;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newRules;
    });
  };

  const handleSaveChanges = async () => {
      setIsSaving(true);
      const toastId = toast.loading('Saving rules...');
      try {
          const res = await fetch(`/api/chamas/${chama._id}/rules`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(rules),
          });
          const data = await res.json();
          if(!res.ok) throw new Error(data.error);
          toast.success('Rules saved successfully!', { id: toastId });
          setRules(data.rules);
      } catch(error) {
          toast.error(error.message, { id: toastId });
      } finally {
          setIsSaving(false);
      }
  };

  if (isLoading) return <p>Loading rules...</p>;
  if (!rules) return <p>Could not load rules configuration.</p>;

  const isChairperson = userRole === 'chairperson';

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <ShieldCheckIcon className="w-7 h-7 mr-3 text-indigo-600"/>
        Rules & Penalties
      </h2>
      
      <div className="space-y-8">
        {/* Late Penalty Section */}
        <div className="border p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Late Contribution Penalty</h3>
            {isChairperson && (
                <input 
                    type="checkbox" 
                    className="toggle-checkbox"
                    checked={rules.latePenalty?.enabled || false}
                    onChange={() => handleToggle('latePenalty.enabled')}
                />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Automatically apply a penalty for contributions made after the grace period.</p>
          
          {(rules.latePenalty?.enabled) && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium">Penalty Amount (KES)</label>
                <input 
                    type="number" 
                    value={rules.latePenalty?.amount || ''}
                    onChange={(e) => handleChange('latePenalty.amount', e.target.value)}
                    className="w-full border p-2 rounded mt-1" 
                    disabled={!isChairperson}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Grace Period (Days)</label>
                <input 
                    type="number" 
                    value={rules.latePenalty?.gracePeriodDays || ''}
                    onChange={(e) => handleChange('latePenalty.gracePeriodDays', e.target.value)}
                    className="w-full border p-2 rounded mt-1" 
                    disabled={!isChairperson}
                />
              </div>
            </div>
          )}
        </div>

        {/* Meeting Attendance (Example of another rule) */}
        <div className="border p-4 rounded-lg opacity-50">
             <h3 className="text-lg font-semibold">Meeting Attendance Penalty (Coming Soon)</h3>
             <p className="text-sm text-gray-500 mt-1">Apply a penalty for members who miss scheduled meetings.</p>
        </div>

      </div>

      {isChairperson && (
          <div className="mt-8 border-t pt-6 text-right">
              <button 
                  onClick={handleSaveChanges} 
                  disabled={isSaving}
                  className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                  {isSaving ? 'Saving...' : 'Save Rules'}
              </button>
          </div>
      )}
    </div>
  );
}
