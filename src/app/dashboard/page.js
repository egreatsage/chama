'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';

// You can keep the StatCard component as it is

function DashboardContent() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [chamas, setChamas] = useState([]); // State for user's chamas
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both stats and chamas
        const statsRes = await fetch('/api/dashboard-stats');
        const chamasRes = await fetch('/api/chamas/my-chamas');

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        if (chamasRes.ok) {
          const chamasData = await chamasRes.json();
          setChamas(chamasData.chamas);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'suspended':
        case 'rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
          <p className="text-gray-600">Here is a summary of your account.</p>
        </div>
        <Link href="/chamas/create">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700">
            + Create New Chama
          </button>
        </Link>
      </div>

      {/* Your existing stats cards can go here */}

      {/* New Section for "My Chamas" */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Chamas</h2>
        {chamas.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-lg shadow">
            <p className="text-gray-500">You haven't joined or created any Chamas yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {chamas.map((chama) => (
              <div key={chama._id} className="bg-white overflow-hidden shadow rounded-lg p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{chama.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(chama.status)}`}>
                      {chama.status.charAt(0).toUpperCase() + chama.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">{chama.description || 'No description'}</p>
                </div>
                <div className="mt-4">
                  <Link href={`/chama/${chama._id}`}>
                    <button className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                      View Details &rarr;
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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