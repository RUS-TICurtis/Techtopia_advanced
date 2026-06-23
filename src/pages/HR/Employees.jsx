import React, { useState, useEffect } from 'react';
import { Plus as PlusIcon, Search as MagnifyingGlassIcon, X as XIcon, Edit2 as EditIcon, Trash2 as TrashIcon, Eye as EyeIcon } from 'lucide-react';
import { hrEmployeesApi, hrDepartmentsApi } from '../../lib/hrApi';
import { usersApi } from '../../lib/api';

export default function Employees() {
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    departmentId: '',
    employeeNumber: '',
    jobTitle: '',
    hireDate: new Date().toISOString().split('T')[0],
    employmentStatus: 'Active', // string enum
    payFrequency: 'Monthly' // string enum
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesData, usersData, deptsData] = await Promise.all([
        hrEmployeesApi.list(),
        usersApi.list(),
        hrDepartmentsApi.list()
      ]);
      
      const employeesList = Array.isArray(employeesData) ? employeesData : (employeesData?.data || employeesData?.items || []);
      const usersList = Array.isArray(usersData) ? usersData : (usersData?.data || usersData?.items || usersData?.users || []);
      const deptsList = Array.isArray(deptsData) ? deptsData : (deptsData?.data || deptsData?.items || []);
      
      setUsers(usersList);
      setDepartments(deptsList);
      
      const mappedEmployees = employeesList.map(e => {
        const userName = e.user ? `${e.user.firstName || ''} ${e.user.lastName || ''}`.trim() : `Emp #${e.employeeNumber}`;
        return {
          id: e.id,
          name: userName || 'Unknown Employee',
          role: e.jobTitle || 'Standard Role',
          department: e.department?.name || 'Unassigned',
          status: e.employmentStatus === 'Active' ? 'Active' : (e.employmentStatus === 'Terminated' ? 'Terminated' : (e.employmentStatus || 'Inactive')),
          raw: e
        };
      });
      
      setEmployees(mappedEmployees);
    } catch (err) {
      console.error('Failed to fetch employees data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormData({
      userId: '',
      departmentId: '',
      employeeNumber: '',
      jobTitle: '',
      hireDate: new Date().toISOString().split('T')[0],
      employmentStatus: 'Active',
      payFrequency: 'Monthly'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      userId: emp.raw.userId || '',
      departmentId: emp.raw.departmentId || '',
      employeeNumber: emp.raw.employeeNumber || '',
      jobTitle: emp.raw.jobTitle || '',
      hireDate: emp.raw.hireDate ? emp.raw.hireDate.split('T')[0] : new Date().toISOString().split('T')[0],
      employmentStatus: emp.raw.employmentStatus || 'Active',
      payFrequency: emp.raw.payFrequency || 'Monthly'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        departmentId: formData.departmentId || null,
        hireDate: new Date(formData.hireDate).toISOString()
      };

      if (editingEmployee) {
        await hrEmployeesApi.update(editingEmployee.id, payload);
      } else {
        await hrEmployeesApi.create(payload);
      }

      setIsModalOpen(false);
      fetchData(); // refresh list
    } catch (err) {
      console.error('Failed to save employee:', err);
      alert('Failed to save employee. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;
    setSubmitting(true);
    try {
      await hrEmployeesApi.delete(deletingEmployee.id);
      setDeletingEmployee(null);
      fetchData();
    } catch (err) {
      console.error('Failed to delete employee:', err);
      alert('Failed to delete employee. It may be linked to other records.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 w-full mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your workforce directory.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Employee
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg flex-1 overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex space-x-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="p-6 text-center text-gray-500">Loading employees...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="relative px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">{person.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{person.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{person.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        person.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1">
                          <EyeIcon size={16} /> View
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(person)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                        >
                          <EditIcon size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => setDeletingEmployee(person)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                        >
                          <TrashIcon size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No employees found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                    </h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                      <XIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select User Account *</label>
                      <select required name="userId" value={formData.userId} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white">
                        <option value="">-- Select a User --</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                      <select name="departmentId" value={formData.departmentId} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white">
                        <option value="">-- Unassigned --</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee Number *</label>
                      <input required type="text" name="employeeNumber" value={formData.employeeNumber} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Title *</label>
                      <input required type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hire Date *</label>
                      <input required type="date" name="hireDate" value={formData.hireDate} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white">
                          <option value="Active">Active</option>
                          <option value="OnLeave">On Leave</option>
                          <option value="Suspended">Suspended</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pay Frequency</label>
                        <select name="payFrequency" value={formData.payFrequency} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white">
                          <option value="Weekly">Weekly</option>
                          <option value="BiWeekly">BiWeekly</option>
                          <option value="SemiMonthly">SemiMonthly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </div>
                    </div>

                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" disabled={submitting} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                    {submitting ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Save Employee'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Employee</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{deletingEmployee.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                disabled={submitting}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
