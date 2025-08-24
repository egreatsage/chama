// src/app/admin/withdrawals/page.js

'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserIcon } from 'lucide-react';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); 
  const [newFirstName, setNewFirstName] = useState(''); 
  const [newLastName, setNewLastName] = useState(''); 
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newpassword, setNewPassword] = useState('');

  

  const fetchAllUsers = async () => {
     setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  

  const handleEdit = (user) => {
    setEditingId(user._id);
    setNewFirstName(user.firstName);
    setNewLastName(user.lastName);
    setNewEmail(user.email);
    setNewRole(user.role);
    setNewPhoneNumber(user.phoneNumber);
    setNewPassword(user.password);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewRole('member');
    setNewPhoneNumber('');
    setNewPassword('');
  };

  const handleSaveEdit = async (id) => {
    if (!newFirstName || !newLastName || !newEmail || !newRole || !newPhoneNumber || !newpassword  ) {
      return toast.error("All fields are required.");
    }

    const toastId = toast.loading('Saving changes...');
    try {
        const res = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                { firstName: newFirstName, lastName: newLastName, email: newEmail, role: newRole, phoneNumber: newPhoneNumber, password: newpassword  }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to save changes');
        }

        toast.success('Details Updated!', { id: toastId });
        setEditingId(null);
        fetchAllUsers(); 
    } catch (error) {
        toast.error(error.message, { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
        const toastId = toast.loading('Deleting user...');
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }

            toast.success('Request deleted!', { id: toastId });
            fetchAllUsers(); // Refresh list
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    }
  };

 

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <Toaster />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage your members</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firstname</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lastname</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">phoneNumber</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">password</th>                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
              ) : users.map((u) => (
                <tr key={u._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                     {u?.photoUrl ? (
                    <img
                      className="h-8 w-8 rounded-full mr-3 object-cover border-2 border-gray-200"
                      src={u.photoUrl}
                      alt={u.fullName}
                      onError={(e) => {
                        // Fallback to user icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <UserIcon 
                    className={`h-5 w-5 mr-2 ${u?.photoUrl ? 'hidden' : 'block'}`} 
                  />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingId === u._id ? (
                      <input
                        type="text"
                        value={newFirstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                        className="w-24 p-1 border rounded"
                      />
                    ) : (u.firstName
                    )}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingId === u._id ? (
                      <input
                        type="text"
                        value={newLastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                        className="w-24 p-1 border rounded"
                      />
                    ) : (u.lastName
                    )}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingId === u._id ? (
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-24 p-1 border rounded"
                      />
                    ) : (u.email
                    )}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingId === u._id ? (
                      <input
                        type="text"
                        value={newPhoneNumber}
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        className="w-24 p-1 border rounded"
                      />
                    ) : (u.phoneNumber
                    )}
                  </td> 
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingId === u._id ? (
                      <input
                        type="text"
                        value={newpassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-24 p-1 border rounded"
                      />
                    ) : (
                        <h1>...</h1>
                    )}
                  </td> 
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {editingId === u._id ? (
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-32 p-1 border rounded"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                            <option value="treasurer">Treasurer</option>
                        </select>
                        ) : (u.role
                        )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     {editingId === u._id ? (
                        <div className="flex space-x-2">
                           <button onClick={() => handleSaveEdit(u._id)} className="text-blue-600 hover:text-blue-900">Save</button>
                           <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">Cancel</button>
                        </div>
                     ) : (
                        <div className="flex space-x-4">
                           <button onClick={() => handleEdit(u)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                           <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:text-red-900">Delete</button>
                            
                        </div>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ManageUsersPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'treasurer']}>
      <ManageUsers />
    </ProtectedRoute>
  );
}