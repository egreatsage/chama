'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, CalendarIcon, UserIcon, StarIcon, BanknotesIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

function PostPageContent() {
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const router = useRouter();
    const { id: chamaId, postId } = params;

    useEffect(() => {
        if (chamaId && postId) {
            const fetchPost = async () => {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/chamas/${chamaId}/posts/${postId}`);
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || 'Failed to fetch post');
                    }
                    const data = await res.json();
                    setPost(data.post);
                    console.log(data.post);
                } catch (error) {
                    toast.error(error.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPost();
        }
    }, [chamaId, postId]);
    
    const getCategoryInfo = (category) => {
        switch (category) {
            case 'Success Story': return { icon: StarIcon, color: 'text-yellow-500 bg-yellow-50 border-yellow-200' };
            case 'Investment Update': return { icon: BanknotesIcon, color: 'text-green-500 bg-green-50 border-green-200' };
            default: return { icon: NewspaperIcon, color: 'text-blue-500 bg-blue-50 border-blue-200' };
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading Story...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-gray-800">Post not found</h2>
                <p className="text-gray-500 mt-2">The story you are looking for does not exist or has been removed.</p>
                 <Link href={`/chamas/${chamaId}`} className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Chama
                </Link>
            </div>
        );
    }
    
    const CategoryIcon = getCategoryInfo(post.category).icon;
    const categoryColor = getCategoryInfo(post.category).color;

    return (
        <div className="bg-white max-w-4xl mx-auto p-4 sm:p-8 rounded-lg shadow-lg">
            <div className="mb-8">
                 <Link href={`/chamas/${chamaId}?tab=updates`} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to All Updates
                </Link>
            </div>

            <article>
                <header className="mb-8">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${categoryColor}`}>
                        <CategoryIcon className="w-5 h-5 mr-2" />
                        {post.category}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                        {post.title}
                    </h1>
                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-1.5" />
                            <span>By {post.authorId.firstName} {post.authorId.lastName}</span>
                        </div>
                        <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1.5" />
                            <time dateTime={post.createdAt}>
                                {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </time>
                        </div>
                    </div>
                </header>

                {post.imageUrl && (
                    <div className="mb-8 rounded-lg overflow-hidden">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover" />
                    </div>
                )}
                
                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                    {post.content}
                </div>
            </article>
        </div>
    );
}

export default function PostPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8">
                <PostPageContent />
            </div>
        </ProtectedRoute>
    )
}
