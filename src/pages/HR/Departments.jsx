import React, { useState, useEffect } from 'react';
import { Plus as PlusIcon, Search as MagnifyingGlassIcon, Building2 as BuildingOfficeIcon, Edit2 as EditIcon, Trash2 as TrashIcon, X as XIcon } from 'lucide-react';
import { hrDepartmentsApi, hrEmployeesApi } from '../../lib/hrApi';

export default function Departments() {
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deletingDept, setDeletingDept] = useState(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: ''
  });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await hrDepartmentsApi.list();
      const deptsList = Array.isArray(data) ? data : (data?.data || data?.items || []);
      
      const mappedDepts = deptsList.map(d => ({
        id: d.id,
        name: d.name || 'Unnamed',
        description: d.description || '',
        managerId: d.managerId || '',
        manager: d.manager ? `${d.manager.user?.firstName || ''} ${d.manager.user?.lastName || ''}`.trim() : 'Unassigned',
      }));
      
      setDepartments(mappedDepts);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await hrEmployeesApi.list();
      const empList = Array.isArray(data) ? data : (data?.data || data?.items || []);
      setEmployees(empList);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({ name: '', description: '', managerId: '' });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name || '',
      description: dept.description || '',
      managerId: dept.managerId || ''
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        managerId: formData.managerId || null
      };

      if (editingDept) {
        await hrDepartmentsApi.update(editingDept.id, payload);
      } else {
        await hrDepartmentsApi.create(payload);
      }

      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to save department. Please try again.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDept) return;
    setFormSaving(true);
    setFormError('');
    try {
      await hrDepartmentsApi.delete(deletingDept.id);
      setDeletingDept(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete department. It may be assigned to employees.');
    } finally {
      setFormSaving(false);
    }
  };

  const filteredDepartments = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 w-full mx-auto h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage organizational structure and department heads.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Department
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex space-x-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
             <div className="p-6 text-center text-gray-500">Loading departments...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                  <th className="relative px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                          <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{dept.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {dept.description || <span className="text-gray-400 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {dept.manager}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleOpenEdit(dept)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                        >
                          <EditIcon size={16} /> Edit
                        </button>
                        <button 
                          onClick={() => setDeletingDept(dept)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                        >
                          <TrashIcon size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDepartments.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No departments found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingDept ? 'Edit Department' : 'Create Department'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <XIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md dark:bg-red-900/30 dark:text-red-400">
                  {formError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500"
                    placeholder="e.g. Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500"
                    placeholder="Describe the department's function..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Manager</label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-500"
                  >
                    <option value="">-- No Manager Assigned --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.user?.firstName} {emp.user?.lastName} ({emp.employeeNumber || 'No ID'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={formSaving}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {formSaving ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDept && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete Department</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete the <strong>{deletingDept.name}</strong> department? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingDept(null)}
                disabled={formSaving}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={formSaving}
                className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {formSaving ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
