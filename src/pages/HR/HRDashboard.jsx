import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Clock as ClockIcon, 
  Calendar as CalendarDaysIcon, 
  BarChart3 as ChartBarIcon 
} from 'lucide-react';
import { usersApi } from '../../lib/api';

export default function HRDashboard() {
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await usersApi.list();
        const usersList = Array.isArray(usersData) ? usersData : (usersData?.data || usersData?.items || usersData?.users || []);
        setEmployeeCount(usersList.length);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  const stats = [
    { name: 'Total Employees', value: employeeCount.toString(), icon: UsersIcon, change: '', changeType: 'neutral' },
    { name: 'On Leave Today', value: '0', icon: CalendarDaysIcon, change: 'Pending BE', changeType: 'neutral' },
    { name: 'Avg Attendance', value: 'N/A', icon: ClockIcon, change: 'Pending BE', changeType: 'neutral' },
    { name: 'Turnover Rate', value: 'N/A', icon: ChartBarIcon, change: 'Pending BE', changeType: 'neutral' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of workforce metrics and intelligence.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="relative bg-white dark:bg-gray-800 pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                item.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'
              }`}>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upcoming Anniversaries</h2>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <span className="text-sm text-gray-500">Analytics charts to be implemented...</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Department Headcount</h2>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <span className="text-sm text-gray-500">Analytics charts to be implemented...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
