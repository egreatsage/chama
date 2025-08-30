'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

// --- Form Step Components ---

const Step1_BasicInfo = ({ formData, handleChange }) => (
  <div>
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Chama Name *
        </label>
        <input 
          type="text" 
          name="name" 
          id="name" 
          value={formData.name} 
          onChange={handleChange} 
          className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base" 
          placeholder="Enter your Chama name"
          required 
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
          Description
        </label>
        <textarea 
          name="description" 
          id="description" 
          rows="4" 
          value={formData.description} 
          onChange={handleChange} 
          className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base resize-none"
          placeholder="Describe the purpose and goals of your Chama"
        />
      </div>
    </div>
  </div>
);

const Step2_OperationType = ({ formData, handleChange }) => (
  <div>
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Choose Chama Type</h2>
    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
      Select how your Chama will operate. This determines how funds are collected and distributed among members.
    </p>
    
    <div className="space-y-4">
      {[
        { value: 'equal_sharing', label: 'Equal Sharing', desc: 'Members save towards a common goal and share equally' },
        { value: 'rotation_payout', label: 'Rotation Payout', desc: 'Members take turns receiving the collected funds (Merry-Go-Round)' },
        { value: 'group_purchase', label: 'Group Purchase', desc: 'Pool money together for bulk purchases or investments' }
      ].map((option) => (
        <label key={option.value} className={`block p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
          formData.operationType === option.value 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200'
        }`}>
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              name="operationType"
              value={option.value}
              checked={formData.operationType === option.value}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{option.label}</div>
              <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
            </div>
          </div>
        </label>
      ))}
    </div>
  </div>
);

const Step3_Configuration = ({ formData, handleChange, handleConfigChange }) => {
  const renderConfigFields = () => {
    switch (formData.operationType) {
      case 'equal_sharing':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                Savings Target Amount (KES)
              </label>
              <input 
                type="number" 
                name="targetAmount" 
                id="targetAmount" 
                value={formData.typeSpecificConfig.targetAmount || ''} 
                onChange={handleConfigChange} 
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base" 
                placeholder="e.g., 100,000"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="savingEndDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Savings End Date
              </label>
              <input 
                type="date" 
                name="savingEndDate" 
                id="savingEndDate" 
                value={formData.typeSpecificConfig.savingEndDate || ''} 
                onChange={handleConfigChange} 
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base" 
              />
            </div>
          </div>
        );
      case 'rotation_payout':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="payoutAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                Payout Amount per Member (KES) *
              </label>
              <input 
                type="number" 
                name="payoutAmount" 
                id="payoutAmount" 
                value={formData.typeSpecificConfig.payoutAmount || ''} 
                onChange={handleConfigChange} 
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base" 
                placeholder="e.g., 5,000"
                min="1"
                required 
              />
            </div>
            <div>
              <label htmlFor="payoutFrequency" className="block text-sm font-semibold text-gray-700 mb-2">
                Payout Frequency
              </label>
              <select 
                name="payoutFrequency" 
                id="payoutFrequency" 
                value={formData.typeSpecificConfig.payoutFrequency || 'monthly'} 
                onChange={handleConfigChange} 
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        );
      case 'group_purchase':
        return (
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-blue-800 font-medium">Configuration Note</p>
            </div>
            <p className="text-blue-700 text-sm leading-relaxed">
              Group purchase configuration will be set up after the Chama is created. You'll be able to define specific purchase goals and member requirements.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Financial Configuration</h2>
      
      {/* Base Configuration */}
      <div className="space-y-6 mb-8">
        <div>
          <label htmlFor="contributionAmount" className="block text-sm font-semibold text-gray-700 mb-2">
            Member Contribution Amount (KES) *
          </label>
          <input 
            type="number" 
            name="contributionAmount" 
            id="contributionAmount" 
            value={formData.contributionAmount} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base" 
            placeholder="e.g., 1,000"
            required 
            min="1" 
          />
        </div>
        <div>
          <label htmlFor="contributionFrequency" className="block text-sm font-semibold text-gray-700 mb-2">
            Contribution Frequency
          </label>
          <select 
            name="contributionFrequency" 
            id="contributionFrequency" 
            value={formData.contributionFrequency} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>
      
      {/* Type-Specific Configuration */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Type-Specific Settings</h3>
        {renderConfigFields()}
      </div>
    </div>
  );
};

// --- Progress Indicator Component ---
const ProgressIndicator = ({ currentStep }) => (
  <div className="mb-8">
    <div className="flex items-center justify-center space-x-2 sm:space-x-4">
      {[1, 2, 3].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div className={`
            w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors
            ${stepNum <= currentStep 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
            }
          `}>
            {stepNum}
          </div>
          {stepNum < 3 && (
            <div className={`
              w-8 sm:w-12 h-1 mx-2 transition-colors
              ${stepNum < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
    <div className="flex justify-center mt-3">
      <span className="text-sm text-gray-600">
        Step {currentStep} of 3
      </span>
    </div>
  </div>
);

// --- Main Form Component ---

export default function CreateChamaForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    operationType: 'equal_sharing',
    contributionAmount: '',
    contributionFrequency: 'monthly',
    typeSpecificConfig: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      typeSpecificConfig: {
        ...prev.typeSpecificConfig,
        [name]: value,
      }
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading('Submitting application...');
    try {
      const res = await fetch('/api/chamas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Chama submitted for approval!', { id: toastId });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create a New Chama
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Set up your savings group in just a few simple steps
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={step} />

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Form Content */}
            <div className="min-h-[400px]">
              {step === 1 && <Step1_BasicInfo formData={formData} handleChange={handleChange} />}
              {step === 2 && <Step2_OperationType formData={formData} handleChange={handleChange} />}
              {step === 3 && <Step3_Configuration formData={formData} handleChange={handleChange} handleConfigChange={handleConfigChange} />}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t border-gray-200">
              <div className="order-2 sm:order-1">
                {step > 1 && (
                  <button 
                    onClick={prevStep} 
                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    ← Back
                  </button>
                )}
              </div>
              
              <div className="order-1 sm:order-2">
                {step < 3 ? (
                  <button 
                    onClick={nextStep} 
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Next →
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit} 
                    disabled={isLoading}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit for Approval'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-xs sm:text-sm text-gray-500">
            Need help? Contact our support team for assistance with setting up your Chama.
          </p>
        </div>
      </div>
    </div>
  );
}