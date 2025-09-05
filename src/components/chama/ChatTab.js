'use client';

import { useState, useEffect, useRef } from 'react';
import useAuthStore from '@/store/authStore';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function ChatTab({ chama }) {
    const { user: currentUser } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/chamas/${chama._id}/messages`);
                if (!res.ok) throw new Error('Failed to fetch messages');
                const data = await res.json();
                setMessages(data.messages);
            } catch (error) {
                console.error('Fetch messages error:', error);
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (chama?._id) {
            fetchMessages();

            // Poll for new messages every 10 seconds (reduced frequency)
            const interval = setInterval(fetchMessages, 10000);
            return () => clearInterval(interval);
        }
    }, [chama?._id]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const messageText = newMessage.trim();
        setIsSending(true);
        setNewMessage(''); // Clear input immediately for better UX

        try {
            const res = await fetch(`/api/chamas/${chama._id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: messageText }),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to send message');
            }
            
            const data = await res.json();
            setMessages(prev => [...prev, data.message]);
        } catch (error) {
            console.error('Send message error:', error);
            toast.error(error.message);
            setNewMessage(messageText); // Restore message on error
        } finally {
            setIsSending(false);
        }
    };

    const formatName = (user) => {
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
    };

    const formatPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return '';
        // Format phone number for display (e.g., +254 xxx xxx xxx)
        return phoneNumber.replace(/(\+\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    };

    if (!chama) {
        return (
            <div className="bg-white shadow-lg rounded-lg border border-gray-200 flex items-center justify-center h-[70vh]">
                <p className="text-gray-500">No chama selected</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 flex flex-col h-[70vh] max-w-full">
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                    The Chama Chat Forum
                </h2>
                </div>

            {/* Messages Area */}
            <div className="flex-1 p-2 md:p-4 overflow-y-auto bg-gray-50">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center text-gray-500">
                            <p className="text-lg mb-2">No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 md:space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex items-start gap-2 md:gap-3 ${
                                    msg.userId._id === currentUser.id ? 'justify-end' : ''
                                }`}
                            >
                                {/* Left side avatar for other users */}
                                {msg.userId._id !== currentUser.id && (
                                    <img
                                        src={msg.userId.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formatName(msg.userId))}&background=ef4444&color=fff`}
                                        alt={formatName(msg.userId)}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                                    />
                                )}

                                {/* Message bubble */}
                                <div className={`flex flex-col max-w-[75%] sm:max-w-xs md:max-w-md ${
                                    msg.userId._id === currentUser.id ? 'items-end' : 'items-start'
                                }`}>
                                    {/* Name and phone number */}
                                    <div className={`text-xs mb-1 px-2 ${
                                        msg.userId._id === currentUser.id ? 'text-right' : 'text-left'
                                    }`}>
                                        <span className="font-medium text-gray-700">
                                            {formatName(msg.userId)}
                                        </span>
                                        {msg.userId.phoneNumber && (
                                            <span className="text-gray-500 ml-1 hidden sm:inline">
                                                ({formatPhoneNumber(msg.userId.phoneNumber)})
                                            </span>
                                        )}
                                    </div>

                                    {/* Message content */}
                                    <div className={`p-3 rounded-lg shadow-sm ${
                                        msg.userId._id === currentUser.id
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                    }`}>
                                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                        <p className={`text-xs mt-2 ${
                                            msg.userId._id === currentUser.id ? 'text-blue-200' : 'text-gray-500'
                                        }`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit',
                                                hour12: true 
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Right side avatar for current user */}
                                {msg.userId._id === currentUser.id && (
                                    <img
                                        src={msg.userId.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formatName(msg.userId))}&background=16a34a&color=fff`}
                                        alt={formatName(msg.userId)}
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                                    />
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2 md:space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={isSending || !newMessage.trim()}
                        className={`rounded-full p-2 md:p-3 transition-all duration-200 flex-shrink-0 ${
                            isSending || !newMessage.trim()
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                        }`}
                    >
                        {isSending ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-white"></div>
                        ) : (
                            <PaperAirplaneIcon className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                    </button>
                </form>
            </div>
            </div>
        
    );
}