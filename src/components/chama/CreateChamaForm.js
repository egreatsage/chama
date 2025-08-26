// src/components/chama/CreateChamaForm.js

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function CreateChamaForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    contributionFrequency: 'monthly',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading('Submitting your application...');

    try {
      const res = await fetch('/api/chamas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create Chama');
      }

      toast.success('Chama submitted for approval!', { id: toastId });
      // Redirect to a page showing all their chamas after a short delay
      setTimeout(() => {
          router.push('/dashboard'); // Or a new '/chamas' page later
      }, 1500);

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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Chama Name</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                />
            </div>
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    name="description"
                    id="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                ></textarea>
            </div>
            <div>
                <label htmlFor="contributionAmount" className="block text-sm font-medium text-gray-700">Contribution Amount (KES)</label>
                <input
                    type="number"
                    name="contributionAmount"
                    id="contributionAmount"
                    value={formData.contributionAmount}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                    min="1"
                />
            </div>
            <div>
                <label htmlFor="contributionFrequency" className="block text-sm font-medium text-gray-700">Contribution Frequency</label>
                <select
                    name="contributionFrequency"
                    id="contributionFrequency"
                    value={formData.contributionFrequency}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                </select>
            </div>
            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isLoading ? 'Submitting...' : 'Create Chama & Submit for Approval'}
                </button>
            </div>
        </form>
    </div>
  );
}