'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { 
    ArrowLeftIcon, UserGroupIcon, BanknotesIcon, CalendarDaysIcon, 
    ChatBubbleLeftRightIcon, DocumentTextIcon 
} from '@heroicons/react/24/outline';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export default function ChamaFullDetails({ params }) {
    const { id } = use(params);
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/admin/chamas/${id}/full-details`);
                if (!res.ok) throw new Error('Failed to load data');
                const result = await res.json();
                setData(result);
            } catch (error) {
                toast.error("Error loading Chama details");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="relative w-14 h-14 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                </div>
                <p className="text-gray-500 text-sm font-medium">Loading data...</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-red-500 font-medium">Chama not found.</p>
            </div>
        </div>
    );

    const { chama, stats, data: records } = data;

    const tabs = [
        { id: 'overview',      label: 'Overview',      icon: DocumentTextIcon,        color: 'blue' },
        { id: 'members',       label: 'Members',        count: records.members.length, icon: UserGroupIcon,           color: 'emerald' },
        { id: 'financials',    label: 'Financials',     icon: BanknotesIcon,           color: 'emerald' },
        { id: 'cycles',        label: 'Cycles',         icon: CalendarDaysIcon,        color: 'blue' },
        { id: 'communication', label: 'Communication',  icon: ChatBubbleLeftRightIcon, color: 'blue' },
    ];

    const tabColors = {
        blue:    { active: 'bg-blue-50 text-blue-700 border border-blue-200',           activeIcon: 'text-blue-500',    badge: 'bg-blue-100 text-blue-700',    hover: 'hover:bg-blue-50 hover:text-blue-600' },
        emerald: { active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',  activeIcon: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700', hover: 'hover:bg-emerald-50 hover:text-emerald-600' },
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                * { font-family: 'DM Sans', sans-serif; }
                .mono { font-family: 'DM Mono', monospace; }

                .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; }
                .stat-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
                .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }

                .row-hover { transition: background 0.1s; }
                .row-hover:hover { background: #f9fafb; }

                .tab-btn { transition: all 0.15s ease; }

                .tag { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; letter-spacing: 0.02em; }

                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: #f1f5f9; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Back link */}
                <Link href="/admin/chamas" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    Back to Chamas
                </Link>

                {/* ── Header Card ── */}
                <div className="card p-6 mb-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-sm flex-shrink-0">
                                    <span className="text-white font-bold text-lg">{chama.name?.charAt(0)}</span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">{chama.name}</h1>
                            </div>
                            {chama.description && (
                                <p className="text-gray-500 text-sm mt-1 max-w-lg">{chama.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className={`tag ${chama.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${chama.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                    {chama.status?.toUpperCase()}
                                </span>
                                <span className="tag bg-gray-100 text-gray-600 border border-gray-200">
                                    {chama.operationType?.replace('_', ' ')}
                                </span>
                                <span className="tag bg-gray-100 text-gray-500 border border-gray-200">
                                    Created {formatDate(chama.createdAt)}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 sm:text-right self-start">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Created by</p>
                            <p className="text-sm font-semibold text-gray-800">{chama.createdBy?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{chama.createdBy?.email}</p>
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="bg-white border border-gray-200 rounded-xl p-1.5 mb-5 flex gap-1 overflow-x-auto shadow-sm">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const c = tabColors[tab.color];
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`tab-btn flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap flex-shrink-0 ${
                                    isActive ? c.active : `text-gray-500 ${c.hover}`
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? c.activeIcon : 'text-gray-400'}`} />
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full mono font-medium ${isActive ? c.badge : 'bg-gray-100 text-gray-500'}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ─────────────────────────── OVERVIEW ─── */}
                {activeTab === 'overview' && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Current Balance',        value: `KES ${chama.currentBalance?.toLocaleString() || 0}`,    accent: 'emerald', icon: '💰' },
                                { label: 'Total Contributions',    value: `KES ${chama.totalContributions?.toLocaleString() || 0}`, accent: 'blue',    icon: '📈' },
                                { label: 'Active Members',         value: records.members.filter(m => m.status === 'active').length, accent: 'emerald', icon: '👥' },
                                { label: 'Contribution Frequency', value: chama.contributionFrequency || '—',                       accent: 'blue',    icon: '🔁' },
                            ].map((item, i) => (
                                <div key={i} className={`stat-card card p-4 border-t-4 ${item.accent === 'emerald' ? 'border-t-emerald-500' : 'border-t-blue-500'}`}>
                                    <div className="text-2xl mb-2">{item.icon}</div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                                    <p className={`text-lg font-bold mt-1 mono ${item.accent === 'emerald' ? 'text-emerald-600' : 'text-blue-600'}`}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="card p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Quick Summary</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { k: 'Total Loans Issued',  v: `KES ${stats.totalLoans?.toLocaleString() || 0}`,        c: 'text-blue-600' },
                                    { k: 'Active Loans',        v: stats.activeLoans || 0,                                   c: 'text-amber-600' },
                                    { k: 'Total Contributions', v: `KES ${stats.totalContributions?.toLocaleString() || 0}`, c: 'text-emerald-600' },
                                    { k: 'Total Members',       v: records.members.length,                                   c: 'text-blue-600' },
                                ].map((row, i) => (
                                    <div key={i} className="flex justify-between items-center py-2.5 px-4 rounded-lg bg-gray-50 border border-gray-100">
                                        <span className="text-gray-600 text-sm">{row.k}</span>
                                        <span className={`font-semibold mono text-sm ${row.c}`}>{row.v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─────────────────────────── MEMBERS ─── */}
                {activeTab === 'members' && (
                    <div className="card overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-semibold text-gray-800">All Members</h3>
                            <span className="text-xs mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">{records.members.length} total</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {records.members.map((member) => (
                                        <tr key={member._id} className="row-hover">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                        {member.userId?.firstName?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{member.userId?.fullName}</div>
                                                        <div className="text-xs text-gray-400 mono">{member.userId?.phoneNumber}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-medium capitalize bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full">
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`tag ${member.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${member.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 mono">{formatDate(member.joinedAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ────────────────────────── FINANCIALS ─── */}
                {activeTab === 'financials' && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Total Contributions', value: `KES ${stats.totalContributions?.toLocaleString()}`, accent: 'emerald', bar: 'w-3/4', icon: '💵' },
                                { label: 'Total Loans Given',   value: `KES ${stats.totalLoans?.toLocaleString()}`,         accent: 'blue',    bar: 'w-1/2', icon: '🏦' },
                                { label: 'Active Loans',        value: stats.activeLoans,                                   accent: 'red',     bar: 'w-1/4', icon: '⚡' },
                            ].map((item, i) => {
                                const c = {
                                    emerald: { text: 'text-emerald-600', bg: 'bg-emerald-500', top: 'border-t-emerald-500' },
                                    blue:    { text: 'text-blue-600',    bg: 'bg-blue-500',    top: 'border-t-blue-500' },
                                    red:     { text: 'text-red-600',     bg: 'bg-red-500',     top: 'border-t-red-500' },
                                }[item.accent];
                                return (
                                    <div key={i} className={`stat-card card p-5 border-t-4 ${c.top}`}>
                                        <div className="text-2xl mb-2">{item.icon}</div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                                        <p className={`text-2xl font-bold mt-1 mono ${c.text}`}>{item.value}</p>
                                        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${c.bg} rounded-full ${item.bar}`}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Contributions */}
                        <div className="card overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                                    Recent Contributions
                                </h3>
                                <span className="text-xs mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">{records.contributions.length} records</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {records.contributions.map((c) => (
                                            <tr key={c._id} className="row-hover">
                                                <td className="px-6 py-3.5 text-sm text-gray-800">{c.userId?.fullName}</td>
                                                <td className="px-6 py-3.5">
                                                    <span className="text-sm font-semibold mono text-emerald-600">+KES {c.amount?.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="text-xs capitalize bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">{c.paymentMethod}</span>
                                                </td>
                                                <td className="px-6 py-3.5 text-xs text-gray-500 mono">{formatDate(c.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Loans */}
                        <div className="card overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block"></span>
                                    Loan History
                                </h3>
                                <span className="text-xs mono text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-full">{records.loans.length} records</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {records.loans.map((l) => (
                                            <tr key={l._id} className="row-hover">
                                                <td className="px-6 py-3.5 text-sm text-gray-800">{l.userId?.fullName}</td>
                                                <td className="px-6 py-3.5">
                                                    <span className="text-sm font-semibold mono text-red-600">KES {l.amount?.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className={`tag ${l.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                        {l.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-xs text-gray-500 mono">{formatDate(l.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ───────────────────────────── CYCLES ─── */}
                {activeTab === 'cycles' && (
                    <div className="card overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-semibold text-gray-800">Cycle History</h3>
                            <span className="text-xs mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">{records.cycles.length} cycles</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cycle #</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {records.cycles.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <p className="text-gray-400 text-sm">No cycles found</p>
                                                <p className="text-gray-300 text-xs mt-1">Cycles will appear here once created</p>
                                            </td>
                                        </tr>
                                    ) : records.cycles.map((cycle) => (
                                        <tr key={cycle._id} className="row-hover">
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mono border border-blue-100">
                                                    {cycle.cycleNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs capitalize bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-md">
                                                    {cycle.cycleType?.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 mono">{formatDate(cycle.startDate)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 mono">{formatDate(cycle.endDate)}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold mono text-emerald-600">+KES {cycle.netProfit?.toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─────────────────────── COMMUNICATION ─── */}
                {activeTab === 'communication' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Announcements */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <h3 className="text-base font-semibold text-gray-800">Announcements</h3>
                                <span className="text-xs mono text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full ml-auto">{records.announcements.length}</span>
                            </div>
                            {records.announcements.length === 0 ? (
                                <div className="card p-8 text-center">
                                    <p className="text-gray-400 text-sm">No announcements yet</p>
                                </div>
                            ) : records.announcements.map(item => (
                                <div key={item._id} className="card p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-semibold text-blue-700 text-sm leading-tight">{item.title}</h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap mono flex-shrink-0">{formatDate(item.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">{item.content}</p>
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                            {item.createdBy?.fullName?.charAt(0)}
                                        </div>
                                        <span className="text-xs text-gray-500">{item.createdBy?.fullName}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Posts */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <h3 className="text-base font-semibold text-gray-800">Posts & News</h3>
                                <span className="text-xs mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full ml-auto">{records.posts.length}</span>
                            </div>
                            {records.posts.length === 0 ? (
                                <div className="card p-8 text-center">
                                    <p className="text-gray-400 text-sm">No posts yet</p>
                                </div>
                            ) : records.posts.map(item => (
                                <div key={item._id} className="card p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-semibold text-gray-800 text-sm leading-tight">{item.title}</h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap mono flex-shrink-0">{formatDate(item.createdAt)}</span>
                                    </div>
                                    <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full">
                                        {item.category}
                                    </span>
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}