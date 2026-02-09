// src/components/navigation/Header.js

'use client';

import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  ChevronDownIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleNavigation = (path) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Chama Us
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Menu as="div" className="relative inline-block text-left">
                {({ close }) => (
                  <>
                    <Menu.Button className="inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
                      {user?.photoUrl ? (
                        <img
                          className="h-8 w-8 rounded-full mr-3 object-cover"
                          src={user.photoUrl}
                          alt={user.fullName || 'User'}
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 mr-2" />
                      )}
                      <span className="truncate max-w-32">{user?.fullName || 'User'}</span>
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 divide-y divide-gray-100">
                        <div className="py-1">
                          {user?.role === 'admin' && (
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href="/admin"
                                  onClick={() => close()}
                                  className={classNames(
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                    'block px-4 py-2 text-sm transition-colors'
                                  )}
                                >
                                  Admin Panel
                                </Link>
                              )}
                            </Menu.Item>
                          )}
                          
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/dashboard"
                                onClick={() => close()}
                                className={classNames(
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'block px-4 py-2 text-sm transition-colors'
                                )}
                              >
                                Dashboard
                              </Link>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href="/profile"
                                onClick={() => close()}
                                className={classNames(
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'block px-4 py-2 text-sm transition-colors'
                                )}
                              >
                                Profile
                              </Link>
                            )}
                          </Menu.Item>
                        </div>

                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  close();
                                  handleLogout();
                                }}
                                className={classNames(
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'block w-full text-left px-4 py-2 text-sm transition-colors'
                                )}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </>
                )}
              </Menu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={mobileMenuOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="flex items-center px-3 py-3 border-b border-gray-200">
                  {user?.photoUrl ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={user.photoUrl}
                      alt={user.fullName || 'User'}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.fullName || 'User'}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                </div>

                {/* Navigation items */}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    Admin Panel
                  </button>
                )}
                
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => handleNavigation('/profile')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Profile
                </button>

                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('/login')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation('/register')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </Transition>
    </header>
  );
}