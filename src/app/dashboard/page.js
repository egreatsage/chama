'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import ProfilePage from '../profile/page';

// Stats Card Component with enhanced styling
const StatCard = ({ title, value, subtitle, icon, gradient }) => (
  <div className={`relative overflow-hidden rounded-2xl shadow-lg border border-white/20 p-6 transform hover:scale-105 transition-all duration-300 ${gradient}`}>
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-semibold text-white/90 uppercase tracking-wider">{title}</p>
          <p className="text-3xl sm:text-4xl font-bold text-white mt-2 drop-shadow-sm">{value}</p>
          {subtitle && <p className="text-xs sm:text-sm text-white/80 mt-2 font-medium">{subtitle}</p>}
        </div>
        {icon && (
          <div className="ml-4 flex-shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
    {/* Decorative elements */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12"></div>
  </div>
);

// Loading Component with animated gradient
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-red-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse mx-auto mb-4"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
      <p className="text-gray-700 font-medium mt-4">Loading your dashboard...</p>
    </div>
  </div>
);

// Empty State Component with vibrant design
const EmptyState = () => (
  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100 p-8 sm:p-12 text-center transform hover:shadow-2xl transition-all duration-300">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-3">
      No Chamas Yet
    </h3>
    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed text-base">
      You haven't joined or created any Chamas yet. Get started by creating your first savings group and begin your journey!
    </p>
    <Link href="/chamas/create">
      <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Your First Chama
      </button>
    </Link>
  </div>
);

// Chama Card Component with vibrant colors
const ChamaCard = ({ chama }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-200';
      case 'pending':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200';
      case 'suspended':
      case 'rejected':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-200';
    }
  };

  const getCardBorder = (status) => {
    switch (status) {
      case 'active':
        return 'border-green-200 hover:border-green-400 hover:shadow-green-100';
      case 'pending':
        return 'border-blue-200 hover:border-blue-400 hover:shadow-blue-100';
      case 'suspended':
      case 'rejected':
        return 'border-red-200 hover:border-red-400 hover:shadow-red-100';
      default:
        return 'border-gray-200 hover:border-gray-400';
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
    <div className={`bg-white rounded-2xl shadow-lg border-2 ${getCardBorder(chama.status)} overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}>
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-2">
              {chama.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                {getOperationTypeLabel(chama.operationType)}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-md ${getStatusBadge(chama.status)}`}>
            {chama.status.charAt(0).toUpperCase() + chama.status.slice(1)}
          </span>
        </div>

        {chama.description && (
          <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
            {chama.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
          {['active', 'approved'].includes(chama.status) ? (
            <Link href={`/chamas/${chama._id}`} className="flex-1">
              <button className="w-full inline-flex items-center justify-center px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                View Details
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          ) : (
            <div className="flex-1 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-red-100 rounded-lg">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-semibold text-red-600">Not Approved</span>
              </div>
            </div>
          )}
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

  const activeChamas = chamas.filter(c => c.status === 'active').length;
  const pendingChamas = chamas.filter(c => c.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <ProfilePage/>
        
        {/* Header Section with gradient */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Welcome back! Manage your Chamas and track your progress
              </p>
            </div>
            <Link href="/chamas/create">
              <button className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Chama
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {chamas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
            <StatCard
              title="Total Chamas"
              value={chamas.length}
              subtitle="All your groups"
              gradient="bg-gradient-to-br from-blue-600 to-blue-700"
              icon={
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <StatCard
              title="Active Chamas"
              value={activeChamas}
              subtitle="Currently running"
              gradient="bg-gradient-to-br from-green-600 to-green-700"
              icon={
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Pending"
              value={pendingChamas}
              subtitle="Awaiting approval"
              gradient="bg-gradient-to-br from-red-500 to-red-600"
              icon={
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        )}

        {/* My Chamas Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                My Chamas
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mt-2">
                Manage your savings groups and track contributions
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 px-4 py-2.5 bg-white rounded-xl shadow-md border-2 border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">{chamas.length} total</span>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700">{activeChamas} active</span>
              </div>
            </div>
          </div>

          {chamas.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
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