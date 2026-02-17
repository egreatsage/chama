// src/app/admin/notifications/page.js
'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/navigation/AdminHeader';
import {
  TrashIcon,
  EnvelopeIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

export default function AdminNotifications() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg._id !== id));
      }
    } catch (error) {
      alert('Failed to delete notification.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-red-50">
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-red-600 bg-clip-text text-transparent">
              User Notifications
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and respond to user inquiries
            </p>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-md px-6 py-4 border-l-4 border-blue-500">
            <p className="text-2xl font-bold text-blue-600">
              {messages.length}
            </p>
            <p className="text-xs text-gray-500">Total Messages</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading notifications...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
              <InboxIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-500">
              You&apos;re all caught up! New messages will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100"
              >
                <div className="p-6 sm:p-8">
                  {/* Top Section */}
                  <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                    <div className="flex-1">
                      {/* Subject + Icon */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0">
                          <EnvelopeIcon className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                            {msg.subject}
                          </h2>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-green-600" />
                          <span className="font-medium truncate">
                            {msg.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                          <a
                            href={`mailto:${msg.email}`}
                            className="text-blue-600 hover:underline truncate"
                          >
                            {msg.email}
                          </a>
                        </div>

                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-green-600" />
                          <a
                            href={`tel:${msg.phone}`}
                            className="text-green-600 hover:underline"
                          >
                            {msg.phone}
                          </a>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {new Date(msg.createdAt).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(msg._id)}
                      className="self-start lg:self-center inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-sm font-medium shadow"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  {/* Message Body */}
                  <div className="mt-6 border-t pt-6">
                    <div className="bg-gray-50 rounded-lg p-5">
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      Reply via Email
                    </a>

                    <a
                      href={`tel:${msg.phone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow"
                    >
                      <PhoneIcon className="w-4 h-4" />
                      Call
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
