import React, { useState, useEffect } from 'react';
import { hrLeaveApi } from '../../lib/hrApi';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function LeaveManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const data = await hrLeaveApi.list();
      const recordsList = Array.isArray(data) ? data : (data?.data || data?.items || []);
      
      const leaveTypes = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid', 'Other'];
      const leaveStatuses = ['Pending Manager', 'Pending HR', 'Approved', 'Rejected'];

      const mapped = recordsList.map(req => ({
        id: req.id,
        employee: req.employee ? `${req.employee.user?.firstName || ''} ${req.employee.user?.lastName || ''}`.trim() : 'Unknown',
        type: leaveTypes[req.type] || 'Other',
        dates: `${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}`,
        statusValue: req.status,
        status: leaveStatuses[req.status] || 'Unknown',
        days: req.daysRequested
      }));
      setRequests(mapped);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleManagerApprove = async (id) => {
    try {
      const dummyManagerId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
      await hrLeaveApi.managerApprove(id, dummyManagerId);
      fetchLeaves();
    } catch (err) { console.error(err); }
  };

  const handleHrApprove = async (id) => {
    try {
      const dummyHrId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
      await hrLeaveApi.hrApprove(id, dummyHrId);
      fetchLeaves();
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try {
      await hrLeaveApi.reject(id);
      fetchLeaves();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review and approve employee time off.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading leave requests...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates (Days)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{req.employee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{req.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{req.dates} ({req.days}d)</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        req.statusValue === 2 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        req.statusValue === 3 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {req.statusValue === 0 && (
                        <button onClick={() => handleManagerApprove(req.id)} className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 inline-flex items-center">
                          <CheckIcon className="mr-1 h-4 w-4"/> Mgr Approve
                        </button>
                      )}
                      {req.statusValue === 1 && (
                        <button onClick={() => handleHrApprove(req.id)} className="text-green-600 hover:text-green-900 dark:hover:text-green-400 inline-flex items-center">
                          <CheckIcon className="mr-1 h-4 w-4"/> HR Approve
                        </button>
                      )}
                      {(req.statusValue === 0 || req.statusValue === 1) && (
                        <button onClick={() => handleReject(req.id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400 inline-flex items-center ml-2">
                          <XMarkIcon className="mr-1 h-4 w-4"/> Reject
                        </button>
                      )}
                      {(req.statusValue === 2 || req.statusValue === 3) && <span className="text-gray-400">No actions</span>}
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
