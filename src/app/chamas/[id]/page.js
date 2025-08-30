'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import toast, { Toaster } from 'react-hot-toast';

// Main Page Component
export default function ChamaDetailPage() {
  const [chama, setChama] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  const params = useParams();
  const { id } = params;

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Chama...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 mx-4 max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Chama</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!chama) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 mx-4 max-w-md">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0012 15c-2.34 0-4.5-.816-6.213-2.173M5.636 5.636L18.364 18.364" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chama Not Found</h3>
          <p className="text-gray-600">The requested Chama could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <ChamaDetailHeader chama={chama} setChama={setChama} />

          <div className="mt-6 lg:mt-8">
            {/* Mobile-friendly tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-3 px-4 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'details'
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`flex-1 py-3 px-4 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === 'members'
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="hidden sm:inline">Members</span>
                    <span className="sm:hidden">Members</span>
                    <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {members.length}
                    </span>
                  </button>
                </nav>
              </div>

              <div className="p-4 sm:p-6">
                {activeTab === 'details' && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Summary</h3>
                    <p className="text-gray-600">Chama financial summaries and reports will be available here soon.</p>
                  </div>
                )}
                {activeTab === 'members' && (
                  <MembersList members={members} chama={chama} onActionComplete={fetchData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Sub-component for the Header/Editor
function ChamaDetailHeader({ chama, setChama }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: chama.name, 
    description: chama.description 
  });

  const handleSave = async () => {
    const toastId = toast.loading('Saving changes...');
    try {
      const res = await fetch(`/api/chamas/${chama._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChama({ ...chama, ...data.chama });
      toast.success('Chama updated successfully!', { id: toastId });
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleCancel = () => {
    setFormData({ name: chama.name, description: chama.description });
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          {isEditing ? (
            <div className="flex-grow space-y-4 mb-4 lg:mb-0 lg:mr-6">
              <div>
                <label htmlFor="chama-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Chama Name
                </label>
                <input
                  id="chama-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-2xl sm:text-3xl font-bold text-gray-900 border-0 border-b-2 border-blue-200 focus:border-blue-500 focus:ring-0 bg-transparent pb-2 transition-colors duration-200"
                  placeholder="Enter Chama name"
                />
              </div>
              <div>
                <label htmlFor="chama-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="chama-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-gray-600 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                  rows="3"
                  placeholder="Enter Chama description"
                />
              </div>
            </div>
          ) : (
            <div className="flex-grow mb-4 lg:mb-0">
              <div className="flex items-center mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mr-3">
                  {chama.name}
                </h1>
                {chama.userRole === 'chairperson' && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Chairperson
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                {chama.description || 'No description provided'}
              </p>
            </div>
          )}

          {chama.userRole === 'chairperson' && (
            <div className="flex-shrink-0">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Edit Details
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for the Members List
function MembersList({ members, chama, onActionComplete }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    const toastId = toast.loading('Sending invitation...');
    try {
      const res = await fetch(`/api/chamas/${chama._id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message, { id: toastId });
      setShowInviteModal(false);
      setInviteEmail('');
      onActionComplete();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the Chama?`)) {
      const toastId = toast.loading('Removing member...');
      try {
        const res = await fetch(`/api/chamas/${chama._id}/members`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success(data.message, { id: toastId });
        onActionComplete();
      } catch (err) {
        toast.error(err.message, { id: toastId });
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3 sm:mb-0">
          Chama Members ({members.length})
        </h2>
        {chama.userRole === 'chairperson' && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Invite Member
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Yet</h3>
          <p className="text-gray-600 mb-4">Start building your Chama by inviting members.</p>
          {chama.userRole === 'chairperson' && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Invite First Member
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(member => (
            <div key={member._id} className="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-3 sm:mb-0">
                <img
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                  src={member.userId?.photoUrl || `https://ui-avatars.com/api/?name=${member.userId?.firstName}+${member.userId?.lastName}&background=3b82f6&color=fff`}
                  alt={`${member.userId?.firstName} ${member.userId?.lastName}`}
                />
                <div className="ml-4">
                  <p className="text-base font-medium text-gray-900">
                    {member.userId?.firstName} {member.userId?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{member.userId?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  member.role === 'chairperson' 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role === 'chairperson' && (
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.953a1 1 0 00-.364-1.118L2.93 9.38c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.953z" clipRule="evenodd" />
                    </svg>
                  )}
                  {member.role}
                </span>
                
                {chama.userRole === 'chairperson' && member.role !== 'chairperson' && (
                  <button
                    onClick={() => handleRemove(member._id, `${member.userId?.firstName} ${member.userId?.lastName}`)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200 focus:outline-none"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Invite New Member</h3>
              <p className="text-sm text-gray-500 mt-1">Send an invitation to join your Chama</p>
            </div>
            
            <form onSubmit={handleInvite} className="px-6 py-4">
              <div className="mb-4">
                <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  {isInviting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}