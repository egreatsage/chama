'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

// Enhanced toggle switch with RGB color scheme
function Toggle({ enabled, onChange, disabled, variant = 'blue' }) {
  const colorClasses = {
    blue: enabled ? 'bg-blue-600' : 'bg-gray-200',
    red: enabled ? 'bg-red-600' : 'bg-gray-200',
    green: enabled ? 'bg-green-600' : 'bg-gray-200'
  };

  const focusClasses = {
    blue: 'focus:ring-blue-500',
    red: 'focus:ring-red-500',
    green: 'focus:ring-green-500'
  };

  return (
    <button
      type="button"
      className={`${colorClasses[variant]} ${focusClasses[variant]} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      disabled={disabled}
    >
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
}

// Input component with validation
function NumberInput({ label, value, onChange, disabled, min = 0, max, placeholder, variant = 'blue' }) {
  const borderClasses = {
    blue: 'focus:border-blue-500 focus:ring-blue-500',
    red: 'focus:border-red-500 focus:ring-red-500',
    green: 'focus:border-green-500 focus:ring-green-500'
  };

  const handleChange = (e) => {
    const val = e.target.value;
    // Only allow positive numbers
    if (val === '' || (!isNaN(val) && parseFloat(val) >= min && (max === undefined || parseFloat(val) <= max))) {
      onChange(val);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input 
        type="number" 
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full border border-gray-300 p-3 rounded-lg transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-opacity-50 ${borderClasses[variant]}`}
        disabled={disabled}
      />
    </div>
  );
}

export default function RulesTab({ chama, userRole }) {
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/chamas/${chama._id}/rules`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to load rules');
        }
        const data = await res.json();
        
        // Ensure nested objects exist with proper defaults
        const safeRules = {
          ...data.rules,
          latePenalty: {
            enabled: false,
            amount: 0,
            gracePeriodDays: 0,
            ...data.rules.latePenalty
          },
          meetingAttendance: {
            required: false,
            penaltyAmount: 0,
            ...data.rules.meetingAttendance
          }
        };
        
        setRules(safeRules);
      } catch (error) {
        console.error('Error fetching rules:', error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (chama?._id) {
      fetchRules();
    }
  }, [chama._id]);
  
  // Enhanced state change handler with validation
  const handleStateChange = (path, value) => {
    setRules(prev => {
      if (!prev) return prev;
      
      const newRules = JSON.parse(JSON.stringify(prev)); // Deep copy
      const keys = path.split('.');
      let current = newRules;
      
      // Navigate to the target property
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = current[keys[i]] || {};
        current = current[keys[i]];
      }
      
      // Set the value with proper type conversion
      const finalKey = keys[keys.length - 1];
      if (typeof value === 'string' && !isNaN(value) && value !== '') {
        current[finalKey] = parseFloat(value);
      } else {
        current[finalKey] = value;
      }
      
      setHasUnsavedChanges(true);
      return newRules;
    });
  };

  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges) {
      toast.success('No changes to save');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Saving rules...');
    
    try {
      const res = await fetch(`/api/chamas/${chama._id}/rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save rules');
      }
      
      toast.success('Rules saved successfully!', { id: toastId });
      setRules(data.rules);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving rules:', error);
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rules) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-lg font-medium">Could not load rules configuration.</div>
          <p className="text-gray-500 mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const isChairperson = userRole === 'chairperson';

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center flex-wrap">
          <ShieldCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0"/>
          <span className="bg-gradient-to-r from-blue-600 via-red-500 to-green-600 bg-clip-text text-transparent">
            Rules & Penalties
          </span>
        </h2>
        {!isChairperson && (
          <p className="text-sm text-gray-500 mt-2 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
            Only the chairperson can modify these rules.
          </p>
        )}
      </div>
      
      <div className="space-y-6 sm:space-y-8">
        {/* Late Penalty Section */}
        <div className="border-2 border-gray-200 hover:border-blue-300 transition-colors duration-200 p-4 sm:p-6 rounded-lg bg-gradient-to-br from-blue-50 via-white to-red-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Late Contribution Penalty
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Automatically apply a penalty for contributions made after the grace period.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Toggle 
                enabled={rules.latePenalty?.enabled || false}
                onChange={() => handleStateChange('latePenalty.enabled', !rules.latePenalty?.enabled)}
                disabled={!isChairperson}
                variant="red"
              />
            </div>
          </div>
          
          {(rules.latePenalty?.enabled) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <NumberInput
                  label="Penalty Amount (KES)"
                  value={rules.latePenalty?.amount}
                  onChange={(value) => handleStateChange('latePenalty.amount', value)}
                  disabled={!isChairperson}
                  min={0}
                  max={10000}
                  placeholder="e.g. 100"
                  variant="red"
                />
                <NumberInput
                  label="Grace Period (Days)"
                  value={rules.latePenalty?.gracePeriodDays}
                  onChange={(value) => handleStateChange('latePenalty.gracePeriodDays', value)}
                  disabled={!isChairperson}
                  min={0}
                  max={30}
                  placeholder="e.g. 3"
                  variant="red"
                />
              </div>
              
              {/* Preview of the rule */}
              {rules.latePenalty?.enabled && rules.latePenalty?.amount > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Rule Preview:</strong> Members will be charged KES {rules.latePenalty.amount} 
                    for contributions made more than {rules.latePenalty.gracePeriodDays || 0} days late.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meeting Attendance Section */}
        <div className="border-2 border-gray-200 hover:border-green-300 transition-colors duration-200 p-4 sm:p-6 rounded-lg bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Meeting Attendance Requirement
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Require members to attend scheduled meetings with optional penalties.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Toggle 
                enabled={rules.meetingAttendance?.required || false}
                onChange={() => handleStateChange('meetingAttendance.required', !rules.meetingAttendance?.required)}
                disabled={!isChairperson}
                variant="green"
              />
            </div>
          </div>
          
          {(rules.meetingAttendance?.required) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <NumberInput
                  label="Penalty Amount (KES)"
                  value={rules.meetingAttendance?.penaltyAmount}
                  onChange={(value) => handleStateChange('meetingAttendance.penaltyAmount', value)}
                  disabled={!isChairperson}
                  min={0}
                  max={5000}
                  placeholder="e.g. 50"
                  variant="green"
                />
                <div className="flex items-end">
                  <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    <strong>Note:</strong> Penalties apply to unexcused absences from scheduled meetings.
                  </div>
                </div>
              </div>

              {/* Preview of the rule */}
              {rules.meetingAttendance?.required && rules.meetingAttendance?.penaltyAmount > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Rule Preview:</strong> Members are required to attend meetings. 
                    Unexcused absences will incur a penalty of KES {rules.meetingAttendance.penaltyAmount}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Future Rules Section */}
        <div className="border-2 border-dashed border-gray-300 p-4 sm:p-6 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Additional Rules (Coming Soon)
          </h3>
          <p className="text-sm text-gray-500 mt-2">More rule types will be available in future updates.</p>
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Contribution Limits</div>
              <div className="text-xs text-gray-500 mt-1">Min/max contribution amounts</div>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Withdrawal Rules</div>
              <div className="text-xs text-gray-500 mt-1">Conditions for fund access</div>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="text-sm font-medium text-gray-600">Custom Policies</div>
              <div className="text-xs text-gray-500 mt-1">Group-specific rules</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isChairperson && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
            {hasUnsavedChanges && (
              <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                You have unsaved changes
              </div>
            )}
            <button 
              onClick={handleSaveChanges} 
              disabled={isSaving || !hasUnsavedChanges}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Rules'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 via-red-50 to-green-50 border border-gray-200 rounded-lg p-4 sm:p-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Current Rules Summary
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center p-2 bg-white rounded border">
            <span className="text-gray-600">Late Penalty:</span>
            <span className={`font-medium ${rules.latePenalty?.enabled ? 'text-red-600' : 'text-gray-400'}`}>
              {rules.latePenalty?.enabled ? `KES ${rules.latePenalty.amount} (${rules.latePenalty.gracePeriodDays}d grace)` : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-white rounded border">
            <span className="text-gray-600">Meeting Attendance:</span>
            <span className={`font-medium ${rules.meetingAttendance?.required ? 'text-green-600' : 'text-gray-400'}`}>
              {rules.meetingAttendance?.required ? `Required (KES ${rules.meetingAttendance.penaltyAmount} penalty)` : 'Optional'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}