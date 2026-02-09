// src/components/chama/UpdatesTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { PlusIcon, PencilIcon, TrashIcon, NewspaperIcon, StarIcon, BanknotesIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ImageUpload from '@/components/ui/ImageUpload';
import Link from 'next/link';

export default function UpdatesTab({ chama, userRole }) {
    const { user: currentUser } = useAuthStore();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General News',
        imageUrl: ''
    });

    const canManage = ['chairperson', 'secretary'].includes(userRole);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chamas/${chama._id}/posts`);
            if (!res.ok) throw new Error('Failed to fetch posts');
            const data = await res.json();
            setPosts(data.posts);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (chama?._id) {
            fetchPosts();
        }
    }, [chama?._id]);

    const openModal = (post = null) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title,
                content: post.content,
                category: post.category,
                imageUrl: post.imageUrl || ''
            });
        } else {
            setEditingPost(null);
            setFormData({ title: '', content: '', category: 'General News', imageUrl: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPost(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editingPost ? 'Updating post...' : 'Creating post...');
        
        const url = editingPost
            ? `/api/chamas/${chama._id}/posts/${editingPost._id}`
            : `/api/chamas/${chama._id}/posts`;
        
        const method = editingPost ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(`Post ${editingPost ? 'updated' : 'created'}!`, { id: toastId });
            closeModal();
            fetchPosts();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        e.preventDefault();
        if (window.confirm("Are you sure you want to delete this post?")) {
            const toastId = toast.loading('Deleting post...');
            try {
                const res = await fetch(`/api/chamas/${chama._id}/posts/${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to delete');
                }
                toast.success('Post deleted!', { id: toastId });
                fetchPosts();
            } catch (error) {
                toast.error(error.message, { id: toastId });
            }
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Success Story': 
                return <StarIcon className="w-5 h-5 text-amber-500" />;
            case 'Investment Update': 
                return <BanknotesIcon className="w-5 h-5 text-green-600" />;
            default: 
                return <NewspaperIcon className="w-5 h-5 text-red-600" />;
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Success Story': 
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Investment Update': 
                return 'bg-green-100 text-green-800 border-green-200';
            default: 
                return 'bg-red-100 text-red-800 border-red-200';
        }
    };

    return (
        <div className="bg-gradient-to-br from-white via-red-50/30 to-green-50/30 shadow-2xl rounded-2xl p-4 sm:p-8 border border-gray-100">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-amber-600 bg-clip-text text-transparent">
                        Updates & Stories
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Share news and celebrate successes together</p>
                </div>
                {canManage && (
                    <button 
                        onClick={() => openModal()} 
                        className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        New Post
                    </button>
                )}
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600"></div>
                </div>
            ) : posts.length === 0 ? (
                // Empty State
                <div className="text-center py-16 px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-green-100 mb-4">
                        <NewspaperIcon className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-900">No posts yet</h3>
                    <p className="mt-2 text-base text-gray-600 max-w-sm mx-auto">
                        Share a success story or an update with your members to get started.
                    </p>
                    {canManage && (
                        <button 
                            onClick={() => openModal()}
                            className="mt-6 inline-flex items-center px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Create First Post
                        </button>
                    )}
                </div>
            ) : (
                // Posts Grid
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map(post => (
                        <Link 
                            key={post._id} 
                            href={`/chamas/${chama._id}/posts/${post._id}`} 
                            className="group bg-white border-2 border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:shadow-2xl hover:border-red-300 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {/* Post Image */}
                            {post.imageUrl && (
                                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-red-100 to-green-100">
                                    <img 
                                        src={post.imageUrl} 
                                        alt={post.title} 
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            )}
                            
                            {/* Post Content */}
                            <div className="p-5 flex flex-col flex-grow">
                                {/* Category Badge */}
                                <div className={`inline-flex items-center self-start px-3 py-1.5 rounded-full text-xs font-semibold border mb-3 ${getCategoryColor(post.category)}`}>
                                    {getCategoryIcon(post.category)}
                                    <span className="ml-2">{post.category}</span>
                                </div>
                                
                                {/* Title */}
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors mb-2 line-clamp-2">
                                    {post.title}
                                </h3>
                                
                                {/* Author & Date */}
                                <p className="text-xs text-gray-500 mb-3">
                                    <span className="font-medium text-gray-700">{post.authorId.firstName}</span>
                                    <span className="mx-1.5">•</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                    })}</span>
                                </p>
                                
                                {/* Content Preview */}
                                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 flex-grow mb-4">
                                    {post.content}
                                </p>
                                
                                {/* Footer */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <span className="text-red-600 text-sm font-semibold flex items-center group-hover:text-green-600 transition-colors">
                                        Read More
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"/>
                                    </span>
                                    
                                    {/* Action Buttons */}
                                    {canManage && (
                                        <div className="flex space-x-1 z-10">
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault(); 
                                                    e.stopPropagation(); 
                                                    openModal(post)
                                                }} 
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Edit post"
                                            >
                                                <PencilIcon className="w-4 h-4"/>
                                            </button>
                                            <button 
                                                onClick={(e) => handleDelete(e, post._id)} 
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete post"
                                            >
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 animate-slideUp">
                        <form onSubmit={handleSubmit}>
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-red-600 to-green-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                                <h3 className="text-xl font-bold text-white">
                                    {editingPost ? 'Edit Post' : 'Create New Post'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            
                            {/* Modal Body */}
                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-5">
                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Cover Image
                                        </label>
                                        <ImageUpload 
                                            value={formData.imageUrl} 
                                            onChange={url => setFormData({...formData, imageUrl: url})} 
                                        />
                                    </div>
                                    
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Enter a compelling title..." 
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})} 
                                            className="w-full px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all" 
                                            required 
                                        />
                                    </div>
                                    
                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            value={formData.category} 
                                            onChange={e => setFormData({...formData, category: e.target.value})} 
                                            className="w-full px-4 py-3 text-gray-900 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all bg-white"
                                        >
                                            <option>General News</option>
                                            <option>Success Story</option>
                                            <option>Investment Update</option>
                                        </select>
                                    </div>
                                    
                                    {/* Content */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Content <span className="text-red-500">*</span>
                                        </label>
                                        <textarea 
                                            placeholder="Share your story or update..." 
                                            value={formData.content} 
                                            onChange={e => setFormData({...formData, content: e.target.value})} 
                                            className="w-full text-gray-900 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none" 
                                            rows="6" 
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-2xl border-t border-gray-200">
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-green-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-green-700 shadow-lg hover:shadow-xl transition-all"
                                >
                                    {editingPost ? 'Update Post' : 'Publish Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}