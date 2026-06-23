import React, { useState } from 'react';
import { CurrencyDollarIcon, LockClosedIcon, PlayIcon } from '@heroicons/react/24/outline';
import { hrPayrollApi } from '../../lib/hrApi';

export default function Payroll() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false); // Assume no existing runs for now, or fetch from backend if endpoint was added for listing runs (doc didn't specify GET /payroll/runs, only Generate and Lock)
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const dummyAdminId = "admin-user-id";
      const payload = {
        periodName: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        periodStartDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        periodEndDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        processedByUserId: dummyAdminId
      };
      
      const newRun = await hrPayrollApi.generateRun(payload);
      
      const runStatuses = ['Draft', 'Processing', 'Completed', 'Locked'];
      
      setRuns([{
        id: newRun.id,
        periodName: newRun.periodName,
        runDate: new Date(newRun.runDate || Date.now()).toLocaleDateString(),
        statusValue: newRun.status || 0,
        status: runStatuses[newRun.status || 0] || 'Draft',
        payslipCount: newRun.payslips?.length || 0,
      }, ...runs]);
    } catch (err) {
      console.error('Failed to generate payroll:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLock = async (id) => {
    try {
      await hrPayrollApi.lockRun(id);
      setRuns(runs.map(r => r.id === id ? { ...r, statusValue: 3, status: 'Locked' } : r));
    } catch (err) {
      console.error('Failed to lock payroll:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Generate, review, and lock employee payroll runs.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          <PlayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          {isGenerating ? 'Generating...' : 'Generate New Run'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="p-6 text-center text-gray-500">Loading payroll runs...</div>
          ) : runs.length === 0 ? (
             <div className="p-12 text-center text-gray-500 flex flex-col items-center">
               <CurrencyDollarIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
               <p className="text-lg font-medium text-gray-900 dark:text-white">No Payroll Runs</p>
               <p className="text-sm">Click "Generate New Run" to start batch processing.</p>
             </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payslips</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {runs.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                          <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{run.periodName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{run.runDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{run.payslipCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        run.statusValue === 3 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : 
                        run.statusValue === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {run.statusValue !== 3 && (
                        <button onClick={() => handleLock(run.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center">
                          <LockClosedIcon className="mr-1 h-4 w-4"/> Lock
                        </button>
                      )}
                      {run.statusValue === 3 && (
                        <span className="text-gray-400 inline-flex items-center">
                          <LockClosedIcon className="mr-1 h-4 w-4"/> Locked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
