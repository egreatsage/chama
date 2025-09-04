// File Path: src/components/chama/GroupPurchaseTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ShoppingBag, Plus, Check, History, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const formatCurrency = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

export default function GroupPurchaseTab({ chama, members, userRole, onUpdate }) {
  const [goals, setGoals] = useState([]);
  const [currentGoalId, setCurrentGoalId] = useState(null);
  const [history, setHistory] = useState([]); // State for completed cycles
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [goalsRes, historyRes] = await Promise.all([
        fetch(`/api/chamas/${chama._id}/goals`),
        fetch(`/api/chamas/${chama._id}/cycles`)
      ]);
      
      if (!goalsRes.ok) throw new Error('Failed to load purchase goals');
      const goalsData = await goalsRes.json();
      setGoals(goalsData.goals);
      setCurrentGoalId(goalsData.currentGoalId);

      if (!historyRes.ok) throw new Error('Failed to load history');
      const historyData = await historyRes.json();
      // This filters the history to only show records relevant to this chama type
      setHistory(historyData.cycles.filter(c => c.cycleType === 'purchase_cycle'));
      console.log(historyData.cycles); 
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [chama._id]);

  const handleCompleteGoal = async () => {
      if(!window.confirm("Are you sure you want to mark this goal as complete and advance to the next?")) return;
      setIsProcessing(true);
      const toastId = toast.loading('Completing goal...');
      try {
          const res = await fetch(`/api/chamas/${chama._id}/goals`, { method: 'PUT' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          toast.success(data.message, { id: toastId });
          onUpdate(); 
          fetchData(); 
      } catch (error) {
          toast.error(error.message, { id: toastId });
      } finally {
          setIsProcessing(false);
      }
  };

  const generateHistoryExcel = () => {
    if (!history || history.length === 0) {
        toast.error("No purchase history to export.");
        return;
    }

    const excelData = history.map(cycle => ({
        'Beneficiary': `${cycle.beneficiaryId?.firstName || 'N/A'} ${cycle.beneficiaryId?.lastName || ''}`,
        'Item': cycle.itemDescription,
        'Date': new Date(cycle.endDate).toLocaleDateString(),
        'Amount': cycle.actualAmount,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet['!cols'] = [
        { wch: 25 }, // Beneficiary
        { wch: 30 }, // Item
        { wch: 15 }, // Date
        { wch: 15 }, // Amount
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase History');

    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${chama.name}_purchase_history_${currentDate}.xlsx`;
    XLSX.writeFile(workbook, filename);
};


  const activeGoal = goals.find(g => g._id === currentGoalId);
  const queuedGoals = goals.filter(g => g.status === 'queued');

  return (
    <div className="space-y-8">
      {/* Current Goal & Queue Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Active Goal</h2>
        {isLoading ? <p>Loading...</p> : activeGoal ? (
          <div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Beneficiary: {activeGoal.beneficiaryId.firstName} {activeGoal.beneficiaryId.lastName}</p>
                <h3 className="text-xl font-bold text-gray-900">{activeGoal.itemDescription}</h3>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                    <div className="bg-blue-600 h-4 rounded-full" style={{width: `${Math.min((chama.currentBalance / activeGoal.targetAmount) * 100, 100)}%`}}></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                    <span>{formatCurrency(chama.currentBalance)}</span>
                    <span className="font-semibold">{formatCurrency(activeGoal.targetAmount)}</span>
                </div>
            </div>
            {userRole === 'chairperson' && chama.currentBalance >= activeGoal.targetAmount && (
                <div className="mt-4 text-right">
                    <button onClick={handleCompleteGoal} disabled={isProcessing} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center ml-auto">
                        <Check className="w-5 h-5 mr-2"/> {isProcessing ? 'Completing...' : 'Mark as Complete'}
                    </button>
                </div>
            )}
          </div>
        ) : (
            <p className="text-gray-500">There is no active purchase goal.</p>
        )}
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Purchase Queue</h3>
            {userRole === 'chairperson' && (
                <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center"><Plus className="w-5 h-5 mr-2"/> Add Goal</button>
            )}
        </div>
        <ul className="space-y-3 text-gray-700">
            {queuedGoals.length > 0 ? queuedGoals.map((goal, index) => (
                <li key={goal._id} className="p-3 bg-gray-50 rounded-md border-none flex justify-between items-center">
                    <div>
                        <span className="font-semibold mx-2">{index + 1}. {goal.itemDescription}</span>
                        <span className="text-sm text-gray-600"> for {goal.beneficiaryId.firstName}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(goal.targetAmount)}</span>
                </li>
            )) : <p className="text-gray-500 text-sm">No items in the queue.</p>}
        </ul>
      </div>

      {/* --- Purchase History Section --- */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <History className="w-6 h-6 mr-3 text-indigo-600"/>
            Completed Purchases
          </h2>
          <button
              onClick={generateHistoryExcel}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
              <FileDown className="h-4 w-4 mr-2" />
              Export History
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Beneficiary</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length > 0 ? history.map(cycle => (
                <tr key={cycle._id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cycle.beneficiaryId?.firstName || 'N/A'} {cycle.beneficiaryId?.lastName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{cycle.itemDescription}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(cycle.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">{formatCurrency(cycle.actualAmount)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-sm text-gray-500">No purchases have been completed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <AddGoalModal members={members} chamaId={chama._id} onClose={() => setIsModalOpen(false)} onGoalAdded={() => { fetchData(); onUpdate(); }} />}
    </div>
  );
}

// AddGoalModal Sub-component
function AddGoalModal({ members, chamaId, onClose, onGoalAdded }) {
    const [beneficiaryId, setBeneficiaryId] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`/api/chamas/${chamaId}/goals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ beneficiaryId, itemDescription, targetAmount })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("New goal added to the queue!");
            onGoalAdded();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg text-gray-900 font-medium mb-4">Add New Purchase Goal</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 font-medium">Beneficiary</label>
                        <select value={beneficiaryId} onChange={(e) => setBeneficiaryId(e.target.value)} className="w-full border p-2 rounded text-gray-600 mt-1" required>
                            <option value="">Select a member</option>
                            {members.map(m => <option key={m.userId._id} value={m.userId._id}>{m.userId.firstName} {m.userId.lastName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 font-medium">Item Description</label>
                        <input type="text" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} className="w-full border p-2 rounded text-gray-600 mt-1" placeholder="e.g., New Fridge" required />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 font-medium">Target Amount (KES)</label>
                        <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full border p-2 rounded text-gray-600 mt-1" placeholder="e.g., 50000" required />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 text-gray-900 rounded">Cancel</button>
                        <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
                            {isSaving ? 'Adding...' : 'Add to Queue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
