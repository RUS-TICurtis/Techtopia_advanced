import React, { useState, useEffect } from 'react';
import { Plus as PlusIcon, Users as UserGroupIcon } from 'lucide-react';
import { hrRecruitmentApi } from '../../lib/hrApi';

export default function Recruitment() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await hrRecruitmentApi.list();
        const jobsList = Array.isArray(data) ? data : (data?.data || data?.items || []);
        
        const statuses = ['Open', 'Closed', 'OnHold'];
        
        const mappedJobs = jobsList.map(j => ({
          id: j.id,
          title: j.jobTitle || 'Untitled Role',
          department: j.department?.name || 'Unassigned',
          status: statuses[j.status] || 'Unknown',
          dateOpened: new Date(j.dateOpened).toLocaleDateString(),
          applicantsCount: j.applicants ? j.applicants.length : 0
        }));
        
        setJobs(mappedJobs);
      } catch (err) {
        console.error('Failed to fetch recruitments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruitment Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage job postings and track applicants.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Job Listing
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full p-6 text-center text-gray-500">Loading job postings...</div>
        ) : jobs.length === 0 ? (
          <div className="col-span-full p-6 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow">No job postings found.</div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg flex flex-col">
              <div className="p-5 flex-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white truncate" title={job.title}>
                    {job.title}
                  </h3>
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    job.status === 'Open' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    job.status === 'Closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{job.department}</p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <UserGroupIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <p>{job.applicantsCount} Applicants</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 px-5 py-3">
                <div className="text-sm text-center">
                  <button className="font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                    View Applicants
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
