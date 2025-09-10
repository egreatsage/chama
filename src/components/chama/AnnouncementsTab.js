// src/components/chama/AnnouncementsTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { MegaphoneIcon, PlusIcon, PencilIcon, TrashIcon, StarIcon  } from '@heroicons/react/24/outline';

export default function AnnouncementsTab({ chama, userRole }) {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '', isPinned: false });

    const canManage = ['chairperson', 'secretary'].includes(userRole);

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chamas/${chama._id}/announcements`);
            if (!res.ok) throw new Error('Failed to fetch announcements');
            const data = await res.json();
            setAnnouncements(data.announcements);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (chama?._id) {
            fetchAnnouncements();
        }
    }, [chama?._id]);

    const openModal = (announcement = null) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
            setFormData({
                title: announcement.title,
                content: announcement.content,
                isPinned: announcement.isPinned,
            });
        } else {
            setEditingAnnouncement(null);
            setFormData({ title: '', content: '', isPinned: false });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAnnouncement(null);
        setFormData({ title: '', content: '', isPinned: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editingAnnouncement ? 'Updating...' : 'Posting...');
        
        const url = editingAnnouncement
            ? `/api/chamas/${chama._id}/announcements/${editingAnnouncement._id}`
            : `/api/chamas/${chama._id}/announcements`;
        
        const method = editingAnnouncement ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(`Announcement ${editingAnnouncement ? 'updated' : 'posted'}!`, { id: toastId });
            closeModal();
            fetchAnnouncements();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this announcement?")) {
            const toastId = toast.loading('Deleting...');
            try {
                const res = await fetch(`/api/chamas/${chama._id}/announcements/${id}`, {
                    method: 'DELETE',
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to delete');
                }
                toast.success('Announcement deleted!', { id: toastId });
                fetchAnnouncements();
            } catch (error) {
                toast.error(error.message, { id: toastId });
            }
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <MegaphoneIcon className="w-6 h-6 mr-2 text-blue-600" />
                    Announcements
                </h2>
                {canManage && (
                    <button onClick={() => openModal()} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                        <PlusIcon className="w-5 h-5 mr-1" />
                        New
                    </button>
                )}
            </div>

            {isLoading ? (
                <p className='text-gray-800'>Loading announcements...</p>
            ) : announcements.length === 0 ? (
                <div className="text-center py-10">
                    <MegaphoneIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
                     {canManage && (
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new announcement.</p>
                     )}
                    
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map(ann => (
                        <div key={ann._id} className={`p-4 rounded-lg border ${ann.isPinned ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    {ann.isPinned && <p className="text-xs font-semibold text-yellow-800 flex items-center mb-1"><StarIcon  className="w-3 h-3 mr-1"/> Pinned</p>}
                                    <h3 className="font-bold text-gray-900">{ann.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        By {ann.createdBy.firstName} on {new Date(ann.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {canManage && (
                                    <div className="flex space-x-2">
                                        <button onClick={() => openModal(ann)} className="text-gray-500 hover:text-blue-600"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(ann._id)} className="text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </div>
                            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                 <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900">{editingAnnouncement ? 'Edit' : 'New'} Announcement</h3>
                                <div className="mt-4 space-y-4">
                                    <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full text-gray-800 p-2 border rounded" required />
                                    <textarea placeholder="Content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full text-gray-800 p-2 border rounded" rows="5" required></textarea>
                                    <div className="flex items-center">
                                        <input type="checkbox" id="isPinned" checked={formData.isPinned} onChange={e => setFormData({...formData, isPinned: e.target.checked})} className="h-4 w-4 text-gray-800 text-blue-600 border-gray-300 rounded" />
                                        <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-900">Pin this announcement</label>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
