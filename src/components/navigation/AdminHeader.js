// src/components/navigation/AdminHeader.js

'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BookOpenIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '@/store/authStore';

const navigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Members', href: '/admin/users', icon: UsersIcon },
  { name: 'Contributions', href: '/admin/contributions', icon: CurrencyDollarIcon },
  { name: 'Chamas', href: '/admin/chamas', icon: UsersIcon },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: BookOpenIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminHeader({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Auto-close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleNavigation = (href) => {
    setSidebarOpen(false);
    router.push(href);
  };

  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* Logo/Brand */}
      <div className="flex flex-shrink-0 items-center px-4 pb-4 border-b border-gray-200">
        <Link 
          href='/' 
          className='text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors'
          onClick={() => isMobile && setSidebarOpen(false)}
        >
          Chama App
        </Link>
      </div>

      {/* User Info Section */}
      {user && (
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center">
            {user.photoUrl ? (
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={user.photoUrl}
                alt={user.fullName || 'Admin'}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-lg">
                  {user.fullName?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.role === 'admin' ? 'Administrator' : user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="mt-5 flex-1 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={classNames(
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent',
                  'group flex items-center w-full px-2 py-3 text-sm font-medium rounded-md transition-all duration-150'
                )}
              >
                <item.icon
                  className={classNames(
                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 flex-shrink-0 h-6 w-6 transition-colors'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 space-y-2">
        <Link
          href="/dashboard"
          onClick={() => isMobile && setSidebarOpen(false)}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <ChevronLeftIcon className="mr-3 h-5 w-5" />
          Back to Dashboard
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                {/* Close button */}
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-gray-600 transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex flex-col h-full pt-5 pb-4">
                  <SidebarContent isMobile={true} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true" />
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white overflow-y-auto pt-5 shadow-sm">
          <SidebarContent isMobile={false} />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm md:hidden border-b border-gray-200">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-md transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            {navigation.find(item => item.href === pathname)?.name || 'Admin Panel'}
          </div>
          {user?.photoUrl ? (
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={user.photoUrl}
              alt={user.fullName || 'Admin'}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-semibold text-sm">
                {user?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
          )}
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {/* Page header for desktop */}
              <div className="hidden md:block mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {navigation.find(item => item.href === pathname)?.name || 'Admin Panel'}
                </h1>
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}