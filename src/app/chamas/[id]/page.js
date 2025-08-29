'use client';

import { useState, useEffect, Fragment } from 'react';
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

  // Fetch both Chama details and members list
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch chama details
          const chamaRes = await fetch(`/api/chamas/${id}`);
          if (!chamaRes.ok) {
            const data = await chamaRes.json();
            throw new Error(data.error || 'Failed to load Chama details');
          }
          const chamaData = await chamaRes.json();
          setChama(chamaData.chama);

          // Fetch members list
          const membersRes = await fetch(`/api/chamas/${id}/members`);
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
      fetchData();
    }
  }, [id]);

  if (isLoading) return <div className="text-center p-10">Loading Chama...</div>;
  if (error) return <div className="text-center p-10 text-red-600">Error: {error}</div>;
  if (!chama) return <div className="text-center p-10">Chama not found.</div>;

  return (
    <ProtectedRoute>
      <Toaster />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ChamaDetailHeader chama={chama} setChama={setChama} />

        <div className="mt-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button onClick={() => setActiveTab('details')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                Details
              </button>
              <button onClick={() => setActiveTab('members')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'members' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                Members ({members.length})
              </button>
              {/* Add more tabs here later */}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'details' && <p>Chama financial summaries and reports will go here.</p>}
            {activeTab === 'members' && <MembersList members={members} chama={chama} />}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Sub-component for the Header/Editor
function ChamaDetailHeader({ chama, setChama }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: chama.name, description: chama.description });

    const handleSave = async () => {
        const toastId = toast.loading('Saving...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            const data = await res.json();
            setChama({ ...chama, ...data.chama });
            toast.success('Chama updated!', { id: toastId });
            setIsEditing(false);
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };
    
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
            {isEditing ? (
              <div className="flex-grow space-y-4">
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full text-3xl font-bold text-gray-900 border-b-2 pb-1" />
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full text-gray-600 mt-2 border rounded p-2" rows="3" />
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{chama.name}</h1>
                <p className="text-gray-600 mt-2">{chama.description}</p>
              </div>
            )}
            
            {chama.userRole === 'chairperson' && (
              <div className="ml-4 flex-shrink-0">
                {isEditing ? (
                  <div className="flex space-x-2"><button onClick={handleSave} className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm">Save</button><button onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm">Cancel</button></div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="bg-white text-gray-700 px-3 py-1 border rounded-md text-sm">Edit</button>
                )}
              </div>
            )}
          </div>
        </div>
    );
}

// Sub-component for the Members List
function MembersList({ members, chama }) {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    const handleInvite = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Sending invite...');
        try {
            const res = await fetch(`/api/chamas/${chama._id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message, { id: toastId });
            setShowInviteModal(false);
            setInviteEmail('');
            // You would ideally refresh the member list here
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };
    
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Chama Members</h2>
                {chama.userRole === 'chairperson' && (
                    <button onClick={() => setShowInviteModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold">+ Invite Member</button>
                )}
            </div>
            <ul className="divide-y divide-gray-200">
                {members.map(member => (
                    <li key={member._id} className="py-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-full" src={member.userId.photoUrl || `https://ui-avatars.com/api/?name=${member.userId.firstName}+${member.userId.lastName}`} alt="" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{member.userId.firstName} {member.userId.lastName}</p>
                                <p className="text-sm text-gray-500">{member.userId.email}</p>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 capitalize">{member.role}</span>
                    </li>
                ))}
            </ul>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Invite a New Member</h3>
                        <form onSubmit={handleInvite}>
                            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Enter member's email" className="w-full border p-2 rounded mb-4" required />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowInviteModal(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Send Invite</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}