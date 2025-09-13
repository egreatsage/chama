// src/components/chama/VotingTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { PlusIcon, CheckCircleIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
            fetchPolls();
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                Voting & Polls
                            </h2>
                            <p className="text-gray-600 mt-2">Make your voice heard in community decisions</p>
                        </div>
                        {canManage && (
                            <button 
                                onClick={() => setShowModal(true)} 
                                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Create Poll
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Polls Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Active Polls</h3>
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                            {activePolls.length} Live
                        </span>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : activePolls.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                            {activePolls.map(poll => {
                                const userVotedIndex = userVotes[poll._id];
                                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                                return (
                                    <div key={poll._id} className="bg-gradient-to-br from-white to-blue-50/50 rounded-xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="p-6">
                                            <h4 className="font-bold text-gray-800 text-lg mb-3 line-clamp-2">{poll.question}</h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                <ClockIcon className="w-4 h-4 text-green-500" />
                                                <span>Ends: {new Date(poll.endDate).toLocaleString()}</span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {poll.options.map((option, index) => (
                                                    <button 
                                                        key={index} 
                                                        onClick={() => handleVote(poll._id, index)} 
                                                        disabled={userVotedIndex !== undefined}
                                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 disabled:cursor-not-allowed group ${
                                                            userVotedIndex === index 
                                                                ? 'bg-gradient-to-r from-green-100 to-green-50 border-green-300 text-green-800' 
                                                                : userVotedIndex !== undefined
                                                                ? 'bg-gray-50 border-gray-200 text-gray-600'
                                                                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-800 hover:shadow-md transform hover:scale-[1.02]'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium">{option.text}</span>
                                                            {userVotedIndex !== undefined && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold bg-white/80 px-2 py-1 rounded-full">
                                                                        {option.votes} vote{option.votes !== 1 ? 's' : ''}
                                                                    </span>
                                                                    {userVotedIndex === index && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            {userVotedIndex !== undefined && (
                                                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                                    <p className="text-sm text-green-700 font-medium flex items-center">
                                                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                                                        Thank you for voting! Total votes: {totalVotes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClockIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg">No active polls at the moment</p>
                            <p className="text-gray-500 text-sm mt-1">Check back later for new voting opportunities</p>
                        </div>
                    )}
                </div>

                {/* Closed Polls Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Closed Polls</h3>
                        <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                            {closedPolls.length} Completed
                        </span>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                        </div>
                    ) : closedPolls.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {closedPolls.map(poll => {
                                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                                return (
                                    <div key={poll._id} className="bg-gradient-to-br from-white to-red-50/30 rounded-xl shadow-lg border border-red-100 overflow-hidden">
                                        <div className="p-6">
                                            <h4 className="font-bold text-gray-800 text-lg mb-3">{poll.question}</h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                <ClockIcon className="w-4 h-4 text-red-500" />
                                                <span>Closed on {new Date(poll.endDate).toLocaleDateString()}</span>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {poll.options.map((option, index) => {
                                                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                                                    const isWinner = option.votes === Math.max(...poll.options.map(opt => opt.votes)) && option.votes > 0;
                                                    
                                                    return (
                                                        <div key={index} className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className={`font-medium ${isWinner ? 'text-green-700' : 'text-gray-700'}`}>
                                                                    {option.text}
                                                                    {isWinner && <span className="text-xs bg-green-100 text-green-800 ml-2 px-2 py-1 rounded-full">Winner</span>}
                                                                </span>
                                                                <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                                                    {option.votes} ({percentage.toFixed(1)}%)
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                                <div 
                                                                    className={`h-3 rounded-full transition-all duration-500 ${
                                                                        isWinner ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-400 to-blue-500'
                                                                    }`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                                                <p className="text-sm text-gray-600 text-center">
                                                    Total Votes: <span className="font-bold text-gray-800">{totalVotes}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClockIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-lg">No closed polls yet</p>
                            <p className="text-gray-500 text-sm mt-1">Completed polls will appear here</p>
                        </div>
                    )}
                </div>

                {/* Create Poll Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleCreatePoll}>
                                <div className="p-6 sm:p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                            Create New Poll
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Poll Question
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder="What would you like to ask the community?" 
                                                value={newPoll.question} 
                                                onChange={e => setNewPoll({...newPoll, question: e.target.value})} 
                                                className="w-full p-4 text-gray-800 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors" 
                                                required 
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Poll Options
                                            </label>
                                            <div className="space-y-3">
                                                {newPoll.options.map((opt, index) => (
                                                    <div key={index} className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <input 
                                                                type="text" 
                                                                placeholder={`Option ${index + 1}`} 
                                                                value={opt.text} 
                                                                onChange={e => handleOptionChange(index, e.target.value)} 
                                                                className="w-full p-3 text-gray-800 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors" 
                                                                required 
                                                            />
                                                        </div>
                                                        {newPoll.options.length > 2 && (
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeOption(index)} 
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <XMarkIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={addOption} 
                                                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                Add Option
                                            </button>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                End Date & Time
                                            </label>
                                            <input 
                                                type="datetime-local" 
                                                value={newPoll.endDate} 
                                                onChange={e => setNewPoll({...newPoll, endDate: e.target.value})} 
                                                className="w-full p-4 text-gray-800 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors" 
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-end gap-3 rounded-b-2xl">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)} 
                                        className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:from-blue-700 hover:to-green-700 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        Create Poll
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}