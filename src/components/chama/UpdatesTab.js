// src/components/chama/UpdatesTab.js
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { PlusIcon, PencilIcon, TrashIcon, NewspaperIcon, StarIcon, BanknotesIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
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
        e.stopPropagation(); // Prevent link navigation when deleting
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
            case 'Success Story': return <StarIcon className="w-5 h-5 text-yellow-500" />;
            case 'Investment Update': return <BanknotesIcon className="w-5 h-5 text-green-500" />;
            default: return <NewspaperIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Updates & Stories</h2>
                {canManage && (
                    <button onClick={() => openModal()} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                        <PlusIcon className="w-5 h-5 mr-1" />
                        New Post
                    </button>
                )}
            </div>

            {isLoading ? <p>Loading...</p> : posts.length === 0 ? (
                <div className="text-center py-10">
                    <NewspaperIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Share a success story or an update with your members.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map(post => (
                        <Link key={post._id} href={`/chamas/${chama._id}/posts/${post._id}`} className="group bg-gray-50 border rounded-lg overflow-hidden flex flex-col hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                            {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="h-40 w-full object-cover"/>}
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex items-center text-sm text-gray-600 mb-2">
                                    {getCategoryIcon(post.category)}
                                    <span className="ml-2 font-semibold">{post.category}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    By {post.authorId.firstName} on {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                                <p className="mt-2 text-gray-700 text-sm line-clamp-3 flex-grow">{post.content}</p>
                                
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                     <span className="text-blue-600 text-sm font-semibold flex items-center">
                                        Read More
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                    </span>
                                    {canManage && (
                                        <div className="flex space-x-2 z-10">
                                            <button onClick={(e) => {e.preventDefault(); e.stopPropagation(); openModal(post)}} className="text-gray-500 hover:text-blue-600 p-1"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={(e) => handleDelete(e, post._id)} className="text-gray-500 hover:text-red-600 p-1"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                     <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <h3 className="text-lg font-medium">{editingPost ? 'Edit' : 'Create'} Post</h3>
                                <div className="mt-4 space-y-4">
                                    <ImageUpload value={formData.imageUrl} onChange={url => setFormData({...formData, imageUrl: url})} />
                                    <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded" required />
                                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded">
                                        <option>General News</option>
                                        <option>Success Story</option>
                                        <option>Investment Update</option>
                                    </select>
                                    <textarea placeholder="Content" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-2 border rounded" rows="6" required></textarea>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

