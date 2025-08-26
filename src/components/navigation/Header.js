// src/components/navigation/Header.js

'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, UserIcon } from '@heroicons/react/24/outline';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              ChamaApp
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // Authenticated User View (Your existing dropdown)
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {user?.photoUrl ? (
                      <img
                        className="h-8 w-8 rounded-full mr-3 object-cover"
                        src={user.photoUrl}
                        alt={user.fullName}
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 mr-2" />
                    )}
                    <span className="truncate max-w-32">{user?.fullName}</span>
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Menu.Button>
                </div>
                <Transition>
                  
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <Menu.Item>
                        {({ active }) => (
                          <div>
                           
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                   
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <div>
                             {
                      user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                           Dashboard
                        </Link>
                      )
                    }
                          </div>
                        )}
                      </Menu.Item>
                      
                    <div className="py-1">
                       {/* ... your existing menu items ... */}
                       <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block w-full text-left px-4 py-2 text-sm'
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    
                    </div>
                  </Menu.Items>
                 
                </Transition>
              </Menu>
            ) : (
              // Logged-Out User View
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                  Sign In
                </Link>
                <Link href="/register" className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}