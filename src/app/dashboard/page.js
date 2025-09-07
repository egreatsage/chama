'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import ProfilePage from '../profile/page';

// Stats Card Component
const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {icon && (
        <div className="ml-4 flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Loading Component
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading dashboard...</p>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Chamas Yet</h3>
    <p className="text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">
      You haven't joined or created any Chamas yet. Get started by creating your first savings group!
    </p>
    <Link href="/chamas/create">
      <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Your First Chama
      </button>
    </Link>
  </div>
);

// Chama Card Component
const ChamaCard = ({ chama }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOperationTypeLabel = (type) => {
    switch (type) {
      case 'equal_sharing':
        return 'Equal Sharing';
      case 'rotation_payout':
        return 'Rotation Payout';
      case 'group_purchase':
        return 'Group Purchase';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {chama.name}
            </h3>
            
            <p className="text-sm text-gray-500 mt-1">
              {getOperationTypeLabel(chama.operationType)}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(chama.status)}`}>
            {chama.status.charAt(0).toUpperCase() + chama.status.slice(1)}
          </span>
        </div>

        {chama.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {chama.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            <span className="font-medium">KES {chama.contributionAmount?.toLocaleString() || 'N/A'}</span>
            <span className="mx-1">•</span>
            <span className="capitalize">{chama.contributionFrequency}</span>
          </div>
          
          <Link href={`/chamas/${chama._id}`}>
            <button className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              View Details
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

function DashboardContent() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [chamas, setChamas] = useState([]);
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

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ProfilePage/>
        {/* Header Section */}
     
   <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              
            </div>
            <Link href="/chamas/create">
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Chama
              </button>
            </Link>
          </div>
        </div>
     

        {/* My Chamas Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Chamas</h2>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Manage your savings groups and track contributions
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="hidden sm:inline">{chamas.length} total</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full hidden sm:block"></span>
              <span>{chamas.filter(c => c.status === 'active').length} active</span>
            </div>
          </div>

          {chamas.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {chamas.map((chama) => (
                <ChamaCard key={chama._id} chama={chama} />
              ))}
            </div>
          )}
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