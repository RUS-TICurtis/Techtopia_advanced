import { apiClient, createPutResourceService } from './api';

// ─── EMPLOYEES ───
export const hrEmployeesApi = {
  ...createPutResourceService('/api/v1/hr/employees'),
  uploadDocument: (employeeId, formData) => apiClient.post(`/api/v1/hr/employees/${employeeId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  listDocuments: (employeeId) => apiClient.get(`/api/v1/hr/employees/${employeeId}/documents`).then(r => r.data),
};

// ─── DEPARTMENTS ───
export const hrDepartmentsApi = {
  ...createPutResourceService('/api/v1/hr/departments'),
};

// ─── ATTENDANCE ───
export const hrAttendanceApi = {
  list: (params) => apiClient.get('/api/v1/hr/attendance', { params }).then(r => r.data),
  checkIn: (data) => apiClient.post('/api/v1/hr/attendance/check-in', data).then(r => r.data),
  checkOut: (id) => apiClient.put(`/api/v1/hr/attendance/${id}/check-out`).then(r => r.data),
};

// ─── LEAVE MANAGEMENT ───
export const hrLeaveApi = {
  list: (params) => apiClient.get('/api/v1/hr/leave-requests', { params }).then(r => r.data),
  create: (data) => apiClient.post('/api/v1/hr/leave-requests', data).then(r => r.data),
  managerApprove: (id, managerId) => apiClient.put(`/api/v1/hr/leave-requests/${id}/manager-approve`, null, { params: { managerId } }).then(r => r.data),
  hrApprove: (id, hrId) => apiClient.put(`/api/v1/hr/leave-requests/${id}/hr-approve`, null, { params: { hrId } }).then(r => r.data),
  reject: (id) => apiClient.put(`/api/v1/hr/leave-requests/${id}/reject`).then(r => r.data),
  cancel: (id) => apiClient.delete(`/api/v1/hr/leave-requests/${id}/cancel`).then(r => r.data),
};

// ─── PERFORMANCE REVIEWS ───
export const hrPerformanceApi = {
  ...createPutResourceService('/api/v1/hr/performance-reviews'),
};

// ─── RECRUITMENT ───
export const hrRecruitmentApi = {
  ...createPutResourceService('/api/v1/hr/recruitments'),
  updateStatus: (id, status) => apiClient.put(`/api/v1/hr/recruitments/${id}/status`, status, { headers: { 'Content-Type': 'application/json' } }).then(r => r.data),
  createApplicant: (recruitmentId, data) => apiClient.post(`/api/v1/hr/recruitments/${recruitmentId}/applicants`, data).then(r => r.data),
  updateApplicantStatus: (applicantId, status) => apiClient.put(`/api/v1/hr/recruitments/applicants/${applicantId}/status`, status, { headers: { 'Content-Type': 'application/json' } }).then(r => r.data),
};

// ─── ONBOARDING ───
export const hrOnboardingApi = {
  ...createPutResourceService('/api/v1/hr/onboarding-tasks'),
  updateStatus: (id, status) => apiClient.put(`/api/v1/hr/onboarding-tasks/${id}/status`, status, { headers: { 'Content-Type': 'application/json' } }).then(r => r.data),
};

// ─── TRAINING PROGRAMS ───
export const hrTrainingApi = {
  ...createPutResourceService('/api/v1/hr/training-programs'),
};

// ─── PAYROLL ───
export const hrPayrollApi = {
  createSalaryStructure: (data) => apiClient.post('/api/v1/hr/payroll/salary-structures', data).then(r => r.data),
  createTaxRule: (data) => apiClient.post('/api/v1/hr/payroll/tax-rules', data).then(r => r.data),
  generateRun: (data) => apiClient.post('/api/v1/hr/payroll/runs/generate', data).then(r => r.data),
  lockRun: (id) => apiClient.post(`/api/v1/hr/payroll/runs/${id}/lock`).then(r => r.data),
  getPayslip: (id) => apiClient.get(`/api/v1/hr/payroll/payslips/${id}`).then(r => r.data),
};
