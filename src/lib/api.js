/**
 * Axios API Client — Techtopia CRM Hub
 * Abstracts all HTTP calls. Swap mock → real by changing BASE_URL.
 */
import axios from 'axios';

// ─── Config ───────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'https://techtopiagh-crm.onrender.com/';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach JWT + tenant ─────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_access_token');
    const tenantId = localStorage.getItem('crm_tenant_id') || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['Tenant-Id'] = tenantId;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401 / refresh ──────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const accessToken = localStorage.getItem('crm_access_token');
        const refreshToken = localStorage.getItem('crm_refresh_token');
        const tenantId = localStorage.getItem('crm_tenant_id') || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        if (refreshToken && accessToken) {
          const { data } = await axios.post(`${API_BASE}api/v1/auth/refresh`, {
            token: accessToken,
            refreshToken
          }, {
            headers: {
              'Tenant-Id': tenantId,
              'Content-Type': 'application/json'
            }
          });
          localStorage.setItem('crm_access_token', data.accessToken);
          localStorage.setItem('crm_refresh_token', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('crm_access_token');
        localStorage.removeItem('crm_refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Generic CRUD factory ─────────────────────────────────
/**
 * Create a scoped resource service
 * @param {string} path - e.g. '/leads'
 */
export function createResourceService(path) {
  return {
    list: (params) => apiClient.get(path, { params }).then(r => r.data),
    get: (id) => apiClient.get(`${path}/${id}`).then(r => r.data),
    create: (data) => apiClient.post(path, data).then(r => r.data),
    update: (id, data) => apiClient.patch(`${path}/${id}`, data).then(r => r.data),
    delete: (id) => apiClient.delete(`${path}/${id}`).then(r => r.data),
  };
}

// ─── Typed Service Modules ────────────────────────────────
export const authApi = {
  login: (credentials) => apiClient.post('/api/v1/auth/login', credentials).then(r => r.data),
  logout: () => apiClient.post('/api/v1/auth/logout').then(r => r.data),
  refresh: (token, refreshToken) => apiClient.post('/api/v1/auth/refresh', { token, refreshToken }).then(r => r.data),
  me: () => apiClient.get('/api/v1/users/me').then(r => r.data),
  updateProfile: (data) => apiClient.put('/api/v1/users/me', data).then(r => r.data),
};

export const usersApi = {
  list: () => apiClient.get('/api/v1/users').then(r => r.data),
  get: (id) => apiClient.get(`/api/v1/users/${id}`).then(r => r.data),
  create: (data) => apiClient.post('/api/v1/users', data).then(r => r.data),
  update: (id, data) => apiClient.put(`/api/v1/users/${id}`, data).then(r => r.data),
  delete: (id) => apiClient.delete(`/api/v1/users/${id}`).then(r => r.data),
};

export const rolesApi = {
  list: () => apiClient.get('/api/v1/roles').then(r => r.data),
  get: (id) => apiClient.get(`/api/v1/roles/${id}`).then(r => r.data),
  create: (data) => apiClient.post('/api/v1/roles', data).then(r => r.data),
  update: (id, data) => apiClient.put(`/api/v1/roles/${id}`, data).then(r => r.data),
  delete: (id) => apiClient.delete(`/api/v1/roles/${id}`).then(r => r.data),
};

export const leadsApi = {
  ...createResourceService('/api/leads'),
  convert: (id) => apiClient.post(`/api/leads/${id}/convert`).then(r => r.data),
};
export const contactsApi = createResourceService('/api/contacts');
export const companiesApi = createResourceService('/api/companies');
export const dealsApi = createResourceService('/api/opportunities');
export const clientsApi = createResourceService('/api/contacts');
export const projectsApi = createResourceService('/api/projects');
export const tasksApi = createResourceService('/api/tasks');
export const ticketsApi = createResourceService('/api/tickets');
export const invoicesApi = {
  ...createResourceService('/finance/invoices'),
  send: (id) => apiClient.post(`/finance/invoices/${id}/send`).then(r => r.data),
  approve: (id) => apiClient.post(`/finance/invoices/${id}/approve`).then(r => r.data),
  duplicate: (id) => apiClient.post(`/finance/invoices/${id}/duplicate`).then(r => r.data),
};
export const contractsApi = createResourceService('/finance/contracts');
export const teamApi = createResourceService('/api/hr/employees');
export const auditApi = {
  list: (params) => apiClient.get('/api/audit/logs', { params }).then(r => r.data),
  export: (params) => apiClient.get('/api/audit/export', { params, responseType: 'blob' }).then(r => r.data),
};
export const analyticsApi = {
  summary: (params) => apiClient.get('/api/analytics/summary', { params }).then(r => r.data),
  revenue: (params) => apiClient.get('/finance/reports/revenue-summary', { params }).then(r => r.data),
  sales: (params) => apiClient.get('/finance/reports/sales', { params }).then(r => r.data),
  forecast: (params) => apiClient.get('/finance/reports/forecast', { params }).then(r => r.data),
};
export const aiApi = {
  chat: (payload) => apiClient.post('/api/ai/conversations', payload).then(r => r.data),
  generate: (payload) => apiClient.post('/api/ai/generate', payload).then(r => r.data),
  summarize: (payload) => apiClient.post('/api/ai/summarize', payload).then(r => r.data),
};
export const notificationsApi = {
  list: (params) => apiClient.get('/api/communications/notifications', { params }).then(r => r.data),
  markRead: (id) => apiClient.post(`/api/communications/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => apiClient.patch('/api/communications/notifications/read-all').then(r => r.data),
  preferences: () => apiClient.get('/api/communications/notifications/preferences').then(r => r.data),
  updatePreferences: (prefs) => apiClient.patch('/api/communications/notifications/preferences', prefs).then(r => r.data),
};
export const automationsApi = createResourceService('/api/automations');
export const billingApi = {
  invoices: createResourceService('/finance/invoices'),
  subscriptions: createResourceService('/finance/subscriptions'),
  plans: () => apiClient.get('/finance/subscriptions/plans').then(r => r.data),
  usage: () => apiClient.get('/finance/subscriptions/usage').then(r => r.data),
};
export const filesApi = {
  upload: (formData, onProgress) => apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  }).then(r => r.data),
  list: (params) => apiClient.get('/files', { params }).then(r => r.data),
  delete: (id) => apiClient.delete(`/files/${id}`).then(r => r.data),
  getSignedUrl: (id) => apiClient.get(`/files/${id}/url`).then(r => r.data),
};

export default apiClient;
