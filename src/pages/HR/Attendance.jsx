import React, { useState, useEffect } from 'react';
import { hrAttendanceApi } from '../../lib/hrApi';
import { PlayIcon, StopIcon } from '@heroicons/react/24/outline';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const data = await hrAttendanceApi.list();
      const recordsList = Array.isArray(data) ? data : (data?.data || data?.items || []);
      const mapped = recordsList.map(rec => ({
        id: rec.id,
        employeeId: rec.employeeId,
        employee: rec.employee ? `${rec.employee.user?.firstName || ''} ${rec.employee.user?.lastName || ''}`.trim() : 'Unknown',
        date: new Date(rec.date).toLocaleDateString(),
        checkIn: rec.checkInTime ? rec.checkInTime : '-',
        checkOut: rec.checkOutTime ? rec.checkOutTime : '-',
        status: rec.status === 0 ? 'Present' : (rec.status === 1 ? 'Absent' : 'OnLeave')
      }));
      setRecords(mapped);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      // In a real app, EmployeeId comes from context
      const dummyEmployeeId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; 
      await hrAttendanceApi.checkIn({ employeeId: dummyEmployeeId });
      fetchAttendance();
    } catch (err) {
      console.error('Failed to check in:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track employee time and presence.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleCheckIn} className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700">
            <PlayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Check In
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
           <div className="p-6 text-center text-gray-500">Loading attendance records...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{rec.employee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{rec.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{rec.checkIn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{rec.checkOut}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        rec.status === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {rec.checkOut === '-' && (
                        <button onClick={async () => {
                          try {
                            await hrAttendanceApi.checkOut(rec.id);
                            fetchAttendance();
                          } catch(err) { console.error(err); }
                        }} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center">
                          <StopIcon className="mr-1 h-4 w-4"/> Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
