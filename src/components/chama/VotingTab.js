// src/components/chama/VotingTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { PlusIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function VotingTab({ chama, userRole }) {
    const { user: currentUser } = useAuthStore();
    const [polls, setPolls] = useState([]);
    const [userVotes, setUserVotes] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newPoll, setNewPoll] = useState({
        question: '',
        options: [{ text: '' }, { text: '' }],
        endDate: '',
    });

    const canManage = ['chairperson', 'secretary'].includes(userRole);

    const fetchPolls = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chamas/${chama._id}/polls`);
            if (!res.ok) throw new Error('Failed to fetch polls');
            const data = await res.json();
            setPolls(data.polls);
            setUserVotes(data.userVotes);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (chama?._id) {
            fetchPolls();
        }
    }, [chama?._id]);

    const handleVote = async (pollId, optionIndex) => {
        const toastId = toast.loading('Casting your vote...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}/polls/${pollId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionIndex }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Vote cast successfully!', { id: toastId });
            fetchPolls(); // Refresh to show updated results/status
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Creating poll...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}/polls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPoll),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Poll created!', { id: toastId });
            setShowModal(false);
            setNewPoll({ question: '', options: [{ text: '' }, { text: '' }], endDate: '' });
            fetchPolls();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };
    
    const handleOptionChange = (index, value) => {
        const options = [...newPoll.options];
        options[index].text = value;
        setNewPoll({ ...newPoll, options });
    };

    const addOption = () => {
        setNewPoll({ ...newPoll, options: [...newPoll.options, { text: '' }] });
    };

    const removeOption = (index) => {
        const options = newPoll.options.filter((_, i) => i !== index);
        setNewPoll({ ...newPoll, options });
    };

    const activePolls = polls.filter(p => p.status === 'active');
    const closedPolls = polls.filter(p => p.status === 'closed');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Voting & Polls</h2>
                {canManage && (
                    <button onClick={() => setShowModal(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium text-gray-900 rounded-md hover:bg-blue-700">
                        <PlusIcon className="w-5 h-5 mr-1" />
                        Create Poll
                    </button>
                )}
            </div>

            {/* Active Polls */}
            <div>
                <h3 className="text-lg text-gray-900 font-semibold text-gray-700 mb-4">Active Polls</h3>
                {isLoading ? <p className='text-gray-700'>Loading...</p> : activePolls.length > 0 ? (
                    <div className="space-y-4">
                        {activePolls.map(poll => {
                            const userVotedIndex = userVotes[poll._id];
                            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                            return (
                                <div key={poll._id} className="bg-white p-4 rounded-lg shadow border">
                                    <p className="font-semibold text-gray-800">{poll.question}</p>
                                    <p className="text-xs text-gray-700">Ends: {new Date(poll.endDate).toLocaleString()}</p>
                                    <div className="mt-4 space-y-2">
                                        {poll.options.map((option, index) => (
                                            <button key={index} onClick={() => handleVote(poll._id, index)} disabled={userVotedIndex !== undefined}
                                                className={`w-full text-left p-3 text-gray-800 border rounded-md flex justify-between items-center transition-colors disabled:cursor-not-allowed ${userVotedIndex === index ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}`}>
                                                <span>{option.text}</span>
                                                {userVotedIndex !== undefined && (
                                                    <span className="text-sm font-semibold text-gray-800">{option.votes} vote(s)</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {userVotedIndex !== undefined && <p className="text-sm text-green-600 mt-2 flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1"/> You have voted.</p>}
                                </div>
                            );
                        })}
                    </div>
                ) : <p className="text-gray-700">No active polls at the moment.</p>}
            </div>

            {/* Closed Polls */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Closed Polls</h3>
                 {isLoading ? <p className='text-gray-700'>Loading...</p> : closedPolls.length > 0 ? (
                    <div className="space-y-4">
                        {closedPolls.map(poll => {
                            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                            return (
                                <div key={poll._id} className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="font-semibold text-gray-900">{poll.question}</p>
                                    <p className="text-xs text-gray-700 flex items-center"><ClockIcon className="w-3 h-3 mr-1 text-gray-800"/> Closed on {new Date(poll.endDate).toLocaleDateString()}</p>
                                    <div className="mt-4 space-y-2">
                                        {poll.options.map((option, index) => {
                                            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                                            return(
                                                <div key={index}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className='text-gray-800'>{option.text}</span>
                                                        <span className="font-semibold text-gray-800">{option.votes} ({percentage.toFixed(1)}%)</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div className="bg-blue-600 h-2.5  rounded-full" style={{width: `${percentage}%`}}></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 ) : <p className="text-gray-500">No closed polls yet.</p>}
            </div>

            {/* Create Poll Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <form onSubmit={handleCreatePoll}>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">Create New Poll</h3>
                                <div className="mt-4 space-y-4">
                                    <input type="text" placeholder="Poll Question" value={newPoll.question} onChange={e => setNewPoll({...newPoll, question: e.target.value})} className="w-full p-2 text-gray-800 border rounded" required />
                                    <div>
                                        <label className="text-sm font-medium text-gray-900">Options</label>
                                        {newPoll.options.map((opt, index) => (
                                            <div key={index} className="flex items-center space-x-2 mt-1">
                                                <input type="text" placeholder={`Option ${index + 1}`} value={opt.text} onChange={e => handleOptionChange(index, e.target.value)} className="w-full p-2 text-gray-800 border rounded" required />
                                                {newPoll.options.length > 2 && <button type="button" onClick={() => removeOption(index)} className="text-red-500 p-1">✕</button>}
                                            </div>
                                        ))}
                                        <button type="button" onClick={addOption} className="text-sm text-blue-600 mt-2">+ Add Option</button>
                                    </div>
                                    <input type="datetime-local" value={newPoll.endDate} onChange={e => setNewPoll({...newPoll, endDate: e.target.value})} className="w-full p-2 text-gray-800 border rounded" required />
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-900 bg-white border rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
