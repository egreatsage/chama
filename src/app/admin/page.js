// app/admin/page.jsx
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AdminContent() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-2  lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Admin Panel
            </h1>
            <p className="text-gray-600 mb-8">
              This area is only accessible to admin users.
            </p>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Admin Tools
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Link href="/admin/users">
                    <div className="bg-gray-50 p-4 rounded-lg border-l-green-600  border-l-3 cursor-pointer hover:shadow-lg transition-shadow">
                      <h4 className="font-medium text-gray-900">User Management</h4>
                      <p className="text-sm text-gray-600 mt-1">Manage all users in the system</p>
                    </div>
                  </Link>
                  <Link href="/admin/contributions">
                    <div className="bg-gray-50 p-4 rounded-lg border-l-red-600  border-l-3 cursor-pointer hover:shadow-lg transition-shadow">
                      <h4 className="font-medium text-gray-900">Contributions</h4>
                      <p className="text-sm text-gray-600 mt-1">Manage all member Contributions</p>
                    </div>
                  </Link>
                  <Link href="/admin/withdrawals">
                    <div className="bg-gray-50 p-4 rounded-lg border-l-purple-600  border-l-3 cursor-pointer hover:shadow-lg transition-shadow">
                      <h4 className="font-medium text-gray-900">Withdrawals</h4>
                      <p className="text-sm text-gray-600 mt-1">Manage all member Withdrawals</p>
                    </div>
                  </Link>
                  <Link href="/admin/reports">
                    <div className="bg-gray-50 p-4 rounded-lg border-l-blue-600  border-l-3 cursor-pointer hover:shadow-lg transition-shadow">
                      <h4 className="font-medium text-gray-900">Reports</h4>
                      <p className="text-sm text-gray-600 mt-1">View system reports and analytics</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminContent />
    </ProtectedRoute>
  );
}