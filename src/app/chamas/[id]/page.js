'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import toast, { Toaster } from 'react-hot-toast';

// Import all components
import ChamaDetailHeader from '@/components/chama/ChamaDetailHeader';
import MembersList from '@/components/chama/MembersList';
import RotationTab from '@/components/chama/RotationTab';
import EqualSharingTab from '@/components/chama/EqualSharingTab';
import ContributionsTab from '@/components/chama/ContributionsTab';
import EditChamaModal from '@/components/chama/EditChamaModal';
import RulesTab from '@/components/chama/RulesTab';
import ChatTab from '@/components/chama/ChatTab';
import LoansTab from '@/components/chama/LoansTab';
import AnnouncementsTab from '@/components/chama/AnnouncementsTab';
import VotingTab from '@/components/chama/VotingTab';

export default function ChamaDetailPage() {
  const [chama, setChama] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user: currentUser } = useAuthStore();
  const params = useParams();
  const { id } = params;

  const fetchData = async () => {
    if (!id) return;
    setError(null);
    try {
      const [chamaRes, membersRes] = await Promise.all([
        fetch(`/api/chamas/${id}`),
        fetch(`/api/chamas/${id}/members`),
      ]);

      if (!chamaRes.ok) throw new Error('Failed to load Chama details');
      const chamaData = await chamaRes.json();
      setChama(chamaData.chama);

      if (!membersRes.ok) throw new Error('Failed to load members');
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
    setIsLoading(true);
    fetchData();
  }, [id]);
  
  const handleUpdateChama = (updatedChamaData) => {
    setChama(updatedChamaData);
    fetchData();
  };

  // Loading state with enhanced spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading Chama details...</p>
        </div>
      </div>
    );
  }

  // Error state with better styling
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex justify-center items-center px-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!chama) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex justify-center items-center px-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.077-2.33" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chama Not Found</h3>
          <p className="text-gray-600">The requested chama could not be found.</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'members':
        return <MembersList members={members} chama={chama} onActionComplete={fetchData} />;

      case 'contributions':
        return <ContributionsTab chama={chama} members={members} userRole={chama.userRole} currentUserId={currentUser?.id} />;

      case 'rotation':
        if (chama.operationType === 'rotation_payout') {
          return <RotationTab chama={chama} members={members} userRole={chama.userRole} onRotationUpdate={fetchData} />;
        }
        break;
     
      case 'rules':
        return <RulesTab chama={chama} userRole={chama.userRole} />;
        
      case 'chat':
        return <ChatTab chama={chama} />;
        
      case 'loans':
        return <LoansTab chama={chama} userRole={chama.userRole} />;
      case 'announcements':
        return <AnnouncementsTab chama={chama} userRole={chama.userRole} />
      case 'announcements':
        return <AnnouncementsTab chama={chama} userRole={chama.userRole} />
       case 'Voting':
        return <VotingTab chama={chama} userRole={chama.userRole} />

      case 'details':
      default:
        if (chama.operationType === 'equal_sharing') {
          return <EqualSharingTab chama={chama} userRole={chama.userRole} onDataUpdate={fetchData} />;
        }
        return (
          <div className="bg-white shadow-xl rounded-2xl p-6 lg:p-8 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Details</h2>
            </div>
            <p className="text-gray-600 text-lg">General information about this chama.</p>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
          },
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="mb-6 lg:mb-8">
            <ChamaDetailHeader chama={chama} onEditClick={() => setIsEditModalOpen(true)} />
          </div>

          {/* Main Content Container */}
          <div className="bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden">
            {/* Enhanced Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Tabs">
                <div className="flex min-w-full sm:min-w-0 space-x-1 p sm:px-6">
                  <TabButton 
                    isActive={activeTab === 'details'} 
                    onClick={() => setActiveTab('details')}
                    color="blue"
                  >
                    {chama.operationType === 'equal_sharing' ? 'Savings Goal' : 'Details'}
                  </TabButton>
                  
                  <TabButton 
                    isActive={activeTab === 'members'} 
                    onClick={() => setActiveTab('members')}
                    color="green"
                  >
                    <span className="flex items-center space-x-2">
                      <span>Members</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                        {members.length}
                      </span>
                    </span>
                  </TabButton>
                  
                  <TabButton 
                    isActive={activeTab === 'contributions'} 
                    onClick={() => setActiveTab('contributions')}
                    color="blue"
                  >
                    Contributions
                  </TabButton>
                  
                  {chama.operationType === 'rotation_payout' && (
                    <TabButton 
                      isActive={activeTab === 'rotation'} 
                      onClick={() => setActiveTab('rotation')}
                      color="green"
                    >
                      Rotation
                    </TabButton>
                  )}
                  
                
                  
                  <TabButton 
                    isActive={activeTab === 'rules'} 
                    onClick={() => setActiveTab('rules')}
                    color="red"
                  >
                    <span className="hidden sm:inline">Rules & Settings</span>
                    <span className="sm:hidden">Rules</span>
                  </TabButton>
                  
                  <TabButton 
                    isActive={activeTab === 'loans'} 
                    onClick={() => setActiveTab('loans')}
                    color="green"
                  >
                    Loans
                  </TabButton>
                  
                  <TabButton 
                    isActive={activeTab === 'chat'} 
                    onClick={() => setActiveTab('chat')}
                    color="blue"
                  >
                    Chat
                  </TabButton>
                  <TabButton 
                    isActive={activeTab === 'announcements'} 
                    onClick={() => setActiveTab('announcements')}
                    color="blue"
                  >
                    Announcements
                  </TabButton>
                  <TabButton 
                    isActive={activeTab === 'Voting'} 
                    onClick={() => setActiveTab('Voting')}
                    color="teal"
                  >
                    Voting
                  </TabButton>
                </div>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      <EditChamaModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        chama={chama}
        onUpdate={handleUpdateChama}
      />
    </ProtectedRoute>
  );
}

function TabButton({ isActive, onClick, children, color = 'blue' }) {
  const colorClasses = {
    blue: {
      active: 'border-blue-500 text-blue-700 bg-blue-50',
      inactive: 'border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50'
    },
    green: {
      active: 'border-green-500 text-green-700 bg-green-50',
      inactive: 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-300 hover:bg-green-50'
    },
    red: {
      active: 'border-red-500 text-red-700 bg-red-50',
      inactive: 'border-transparent text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50'
    }
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <button
      onClick={onClick}
      className={`
        relative whitespace-nowrap py-4 px-3 sm:px-4 border-b-3 font-semibold text-sm sm:text-base
        transition-all duration-300 ease-in-out transform hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        rounded-t-lg min-w-max
        ${isActive ? classes.active : classes.inactive}
      `}
    >
      {children}
      {isActive && (
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
          color === 'blue' ? 'from-blue-500 to-blue-600' :
          color === 'green' ? 'from-green-500 to-green-600' :
          'from-red-500 to-red-600'
        } rounded-t-full`} />
      )}
    </button>
  );
}