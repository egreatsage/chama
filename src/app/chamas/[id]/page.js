// File Path: src/app/chamas/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import toast, { Toaster } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

// Import all modular components
import ChamaDetailHeader from '@/components/chama/ChamaDetailHeader';
import MembersList from '@/components/chama/MembersList';
import RotationTab from '@/components/chama/RotationTab';
import EqualSharingTab from '@/components/chama/EqualSharingTab';
import ContributionsTab from '@/components/chama/ContributionsTab';

// Main Page Component
export default function ChamaDetailPage() {
  const [chama, setChama] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const { user } = useAuthStore(); // Get the currently logged-in user

  const params = useParams();
  const { id } = params;

  // --- Data Fetching ---
  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [chamaRes, membersRes] = await Promise.all([
        fetch(`/api/chamas/${id}`),
        fetch(`/api/chamas/${id}/members`),
      ]);

      if (!chamaRes.ok) {
        const data = await chamaRes.json();
        throw new Error(data.error || 'Failed to load Chama details');
      }
      const chamaData = await chamaRes.json();
      setChama(chamaData.chama);

      if (!membersRes.ok) {
        const data = await membersRes.json();
        throw new Error(data.error || 'Failed to load members');
      }
      const membersData = await membersRes.json();
      setMembers(membersData.members);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  }

  if (!chama) {
    return <div className="text-center p-10">Chama not found.</div>;
  }

  // --- Tab Content Renderer ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'contributions':
        return (
          <ContributionsTab
            chama={chama}
            members={members}
            userRole={chama.userRole}
            currentUserId={user?.id}
          />
        );
      case 'members':
        return (
          <MembersList
            members={members}
            chama={chama}
            onActionComplete={fetchData}
          />
        );
      case 'rotation':
        return chama.operationType === 'rotation_payout' ? (
          <RotationTab
            chama={chama}
            members={members}
            userRole={chama.userRole}
            onRotationUpdate={fetchData}
          />
        ) : null;
      case 'details':
      default:
        if (chama.operationType === 'equal_sharing') {
          return <EqualSharingTab chama={chama} />;
        }
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="text-gray-600 mt-2">
              A general overview for this chama type will be displayed here.
            </p>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ChamaDetailHeader chama={chama} setChama={setChama} />

        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <TabButton
                isActive={activeTab === 'details'}
                onClick={() => setActiveTab('details')}
              >
                {chama.operationType === 'equal_sharing' ? 'Savings Goal' : 'Details'}
              </TabButton>
              <TabButton
                isActive={activeTab === 'contributions'}
                onClick={() => setActiveTab('contributions')}
              >
                Contributions
              </TabButton>
              <TabButton
                isActive={activeTab === 'members'}
                onClick={() => setActiveTab('members')}
              >
                Members ({members.length})
              </TabButton>
              {chama.operationType === 'rotation_payout' && (
                <TabButton
                  isActive={activeTab === 'rotation'}
                  onClick={() => setActiveTab('rotation')}
                >
                  Rotation
                </TabButton>
              )}
            </nav>
          </div>

          <div className="py-6">{renderTabContent()}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// A small helper component to keep the tab navigation clean
function TabButton({ isActive, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
        isActive
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

