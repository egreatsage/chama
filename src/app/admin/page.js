// src/app/admin/page.js
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chamas, setChamas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // ID of chama being processed
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Parallel fetch for speed
      const [statsRes, chamasRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/chamas')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (chamasRes.ok) {
        const data = await chamasRes.json();
        setChamas(data.chamas || []);
      }
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const updateChamaStatus = async (chamaId, newStatus) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    
    setActionLoading(chamaId);
    try {
      const res = await fetch(`/api/admin/chamas/${chamaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Optimistic update
        setChamas(prev => prev.map(c => 
          c._id === chamaId ? { ...c, status: newStatus } : c
        ));
        // Refresh stats as well to reflect active/dormant changes
        const statsRes = await fetch('/api/admin/dashboard');
        if (statsRes.ok) setStats(await statsRes.json());
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* 1. At-a-Glance Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Financial Flow Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vol. Transacted (Mo)</dt>
                  <dd className="text-lg font-bold text-gray-900">KES {stats?.financials?.currentMonth?.toLocaleString()}</dd>
                  <dd className={`text-xs ${stats?.financials?.currentMonth >= stats?.financials?.lastMonth ? 'text-green-600' : 'text-red-600'}`}>
                    vs KES {stats?.financials?.lastMonth?.toLocaleString()} last mo.
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* User Growth Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats?.users?.total}</dd>
                  <dd className="text-xs text-green-600">+{stats?.users?.newToday} new today</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Chama Activity Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Chamas</dt>
                  <dd className="text-lg font-bold text-gray-900">{stats?.chamas?.active} / {stats?.chamas?.total}</dd>
                  <dd className="text-xs text-gray-500">{stats?.chamas?.dormant} dormant</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${stats?.system?.mpesa === 'Online' ? 'bg-teal-500' : 'bg-red-500'}`}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">System Health</dt>
                  <dd className="text-lg font-bold text-gray-900">MPesa: {stats?.system?.mpesa}</dd>
                  <dd className="text-xs text-gray-500">DB: {stats?.system?.database}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Chama Oversight Module */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Chama Oversight</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Monitor and manage all groups on the platform.</p>
          </div>
        </div>
        <div className="border-t border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chama Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chairman</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chamas.map((chama) => (
                <tr key={chama._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{chama.name}</div>
                    <div className="text-sm text-gray-500">{chama.operationType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{chama.createdBy?.firstName} {chama.createdBy?.lastName}</div>
                    <div className="text-sm text-gray-500">{chama.createdBy?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-semibold">
                      KES {(chama.currentBalance || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${chama.status === 'active' ? 'bg-green-100 text-green-800' : 
                        chama.status === 'suspended' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {chama.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {chama.status !== 'suspended' && (
                       <button
                         onClick={() => updateChamaStatus(chama._id, 'suspended')}
                         disabled={actionLoading === chama._id}
                         className="text-red-600 hover:text-red-900 disabled:opacity-50"
                       >
                         {actionLoading === chama._id ? '...' : 'Suspend'}
                       </button>
                    )}
                    {(chama.status === 'pending' || chama.status === 'suspended') && (
                      <button
                        onClick={() => updateChamaStatus(chama._id, 'active')}
                        disabled={actionLoading === chama._id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 ml-2"
                      >
                        {actionLoading === chama._id ? '...' : 'Verify/Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {chamas.length === 0 && (
            <div className="text-center py-4 text-gray-500">No Chamas found.</div>
          )}
        </div>
      </div>

      {/* 3. Legacy Admin Links (Optional: Keep or Remove) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Link href="/admin/users" className="block p-4 bg-gray-50 rounded border hover:bg-gray-100 text-center">
          <span className="block font-bold">Manage Users</span>
        </Link>
        <Link href="/admin/contributions" className="block p-4 bg-gray-50 rounded border hover:bg-gray-100 text-center">
          <span className="block font-bold">Manage Contributions</span>
        </Link>
        <Link href="/admin/withdrawals" className="block p-4 bg-gray-50 rounded border hover:bg-gray-100 text-center">
          <span className="block font-bold">Manage Withdrawals</span>
        </Link>
        <Link href="/admin/reports" className="block p-4 bg-gray-50 rounded border hover:bg-gray-100 text-center">
          <span className="block font-bold">View Reports</span>
        </Link>
      </div>

    </div>
  );
}