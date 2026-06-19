import React, { useState, useEffect } from 'react';
import { UserCircle as UserCircleIcon, FileText as DocumentTextIcon, Calendar as CalendarIcon } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function SelfService() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await authApi.me();
        setUser(me);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile, leave, and documents.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
          Clock In Now
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex flex-col items-center">
          <UserCircleIcon className="h-16 w-16 text-gray-300 dark:text-gray-600" />
          {loading ? (
             <p className="mt-4 text-sm text-gray-500">Loading profile...</p>
          ) : (
            <>
              <h2 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">
                {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Unknown'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'No email provided'}</p>
            </>
          )}
          <button className="mt-4 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
            Edit Profile
          </button>
        </div>

        {/* Leave Summary */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CalendarIcon className="h-6 w-6 text-indigo-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">My Leave</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Annual Balance</span>
              <span className="font-medium text-gray-900 dark:text-white">12 Days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Sick Leave</span>
              <span className="font-medium text-gray-900 dark:text-white">5 Days</span>
            </div>
            <button className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50">
              Request Time Off
            </button>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DocumentTextIcon className="h-6 w-6 text-indigo-500" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">My Documents</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Employment Contract</span>
              <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">View</button>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Oct 2026 Payslip</span>
              <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">View</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
