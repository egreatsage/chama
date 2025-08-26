// src/app/dashboard/page.js

'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-3xl font-semibold text-gray-900">KES {value.toLocaleString()}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}


function DashboardContent() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard-stats');
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
      <p className="text-gray-600">Here is a summary of your account.</p>
      <Link href="/chamas/create">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700">
                Create New Chama
            </button>
        </Link>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Contributions" value={stats?.totalContributions || 0} />
        <StatCard title="Total Withdrawals" value={stats?.totalWithdrawals || 0} />
        <StatCard title="Your Net Balance" value={stats?.netBalance || 0} />
      </div>

       <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            {/* You can add a list of recent transactions here in the future */}
            <div className="mt-4 bg-white shadow rounded-lg p-5">
                 <p className="text-gray-500">Your recent transactions will appear here.</p>
            </div>
       </div>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}