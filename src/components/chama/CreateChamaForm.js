'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

// --- Form Step Components ---

const Step1_BasicInfo = ({ formData, handleChange }) => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Step 1: Basic Information</h2>
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Chama Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" id="description" rows="3" value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
      </div>
    </div>
  </div>
);

const Step2_OperationType = ({ formData, handleChange }) => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Step 2: Choose Chama Type</h2>
    <p className="text-sm text-gray-600 mb-4">Select how your Chama will operate. This determines how funds are collected and distributed.</p>
    <select name="operationType" id="operationType" value={formData.operationType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
      <option value="equal_sharing">Equal Sharing (Savings Goal)</option>
      <option value="rotation_payout">Rotation Payout (Merry-Go-Round)</option>
      <option value="group_purchase">Group Purchase</option>
    </select>
  </div>
);

const Step3_Configuration = ({ formData, handleChange, handleConfigChange }) => {
  const renderConfigFields = () => {
    switch (formData.operationType) {
      case 'equal_sharing':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">Savings Target Amount (KES)</label>
              <input type="number" name="targetAmount" id="targetAmount" value={formData.typeSpecificConfig.targetAmount || ''} onChange={handleConfigChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., 100000" />
            </div>
            <div>
              <label htmlFor="savingEndDate" className="block text-sm font-medium text-gray-700">Savings End Date</label>
              <input type="date" name="savingEndDate" id="savingEndDate" value={formData.typeSpecificConfig.savingEndDate || ''} onChange={handleConfigChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        );
      case 'rotation_payout':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="payoutAmount" className="block text-sm font-medium text-gray-700">Payout Amount per Member (KES)</label>
              <input type="number" name="payoutAmount" id="payoutAmount" value={formData.typeSpecificConfig.payoutAmount || ''} onChange={handleConfigChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., 5000" required />
            </div>
            <div>
              <label htmlFor="payoutFrequency" className="block text-sm font-medium text-gray-700">Payout Frequency</label>
              <select name="payoutFrequency" id="payoutFrequency" value={formData.typeSpecificConfig.payoutFrequency || 'monthly'} onChange={handleConfigChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        );
      case 'group_purchase':
        return <p className="text-gray-600">Group purchase configuration will be set up after the Chama is created.</p>;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Step 3: Financial Details</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-700">Contribution Amount (KES)</label>
          <input type="number" name="contributionAmount" id="contributionAmount" value={formData.contributionAmount} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required min="1" />
        </div>
        <div>
          <label htmlFor="contributionFrequency" className="block text-sm font-medium text-gray-700">Contribution Frequency</label>
          <select name="contributionFrequency" id="contributionFrequency" value={formData.contributionFrequency} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
        <hr className="my-6" />
        <h3 className="text-md font-semibold mb-2">Type-Specific Settings</h3>
        {renderConfigFields()}
      </div>
    </div>
  );
};

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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a New Chama</h1>
      <div className="mb-6">
          {step === 1 && <Step1_BasicInfo formData={formData} handleChange={handleChange} />}
          {step === 2 && <Step2_OperationType formData={formData} handleChange={handleChange} />}
          {step === 3 && <Step3_Configuration formData={formData} handleChange={handleChange} handleConfigChange={handleConfigChange} />}
      </div>
      
      <div className="flex justify-between mt-8">
        {step > 1 && <button onClick={prevStep} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Back</button>}
        {step < 3 && <button onClick={nextStep} className="bg-indigo-600 text-white px-4 py-2 rounded-md ml-auto">Next</button>}
        {step === 3 && <button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 text-white px-4 py-2 rounded-md ml-auto disabled:opacity-50">{isLoading ? 'Submitting...' : 'Submit for Approval'}</button>}
      </div>
    </div>
  );
}