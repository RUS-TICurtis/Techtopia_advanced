/**
 * Axios API Client — Techtopia CRM Hub
 * Abstracts all HTTP calls. Swap mock → real by changing BASE_URL.
 */
import axios from 'axios';

// ─── Config ───────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'https://techtopia-crm-api.onrender.com/';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach JWT + tenant ─────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_access_token');
    const tenantId = localStorage.getItem('crm_tenant_id');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
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
        const refreshToken = localStorage.getItem('crm_refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          localStorage.setItem('crm_access_token', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
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
  login: (credentials) => apiClient.post('/auth/login', credentials).then(r => r.data),
  logout: () => apiClient.post('/auth/logout').then(r => r.data),
  verifyMfa: (code, tempToken) => apiClient.post('/auth/mfa/verify', { code, tempToken }).then(r => r.data),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }).then(r => r.data),
  me: () => apiClient.get('/auth/me').then(r => r.data),
  sessions: () => apiClient.get('/auth/sessions').then(r => r.data),
  revokeSession: (id) => apiClient.delete(`/auth/sessions/${id}`).then(r => r.data),
};

export const leadsApi = createResourceService('/leads');
export const contactsApi = createResourceService('/contacts');
export const companiesApi = createResourceService('/companies');
export const dealsApi = createResourceService('/deals');
export const clientsApi = createResourceService('/clients');
export const projectsApi = createResourceService('/projects');
export const tasksApi = createResourceService('/tasks');
export const ticketsApi = createResourceService('/tickets');
export const invoicesApi = createResourceService('/invoices');
export const contractsApi = createResourceService('/contracts');
export const teamApi = createResourceService('/team');
export const auditApi = {
  list: (params) => apiClient.get('/audit/logs', { params }).then(r => r.data),
  export: (params) => apiClient.get('/audit/export', { params, responseType: 'blob' }).then(r => r.data),
};
export const analyticsApi = {
  summary: (params) => apiClient.get('/analytics/summary', { params }).then(r => r.data),
  revenue: (params) => apiClient.get('/analytics/revenue', { params }).then(r => r.data),
  sales: (params) => apiClient.get('/analytics/sales', { params }).then(r => r.data),
  forecast: (params) => apiClient.get('/analytics/forecast', { params }).then(r => r.data),
};
export const aiApi = {
  chat: (payload) => apiClient.post('/ai/chat', payload).then(r => r.data),
  generate: (payload) => apiClient.post('/ai/generate', payload).then(r => r.data),
  summarize: (payload) => apiClient.post('/ai/summarize', payload).then(r => r.data),
};
export const notificationsApi = {
  list: (params) => apiClient.get('/notifications', { params }).then(r => r.data),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => apiClient.patch('/notifications/read-all').then(r => r.data),
  preferences: () => apiClient.get('/notifications/preferences').then(r => r.data),
  updatePreferences: (prefs) => apiClient.patch('/notifications/preferences', prefs).then(r => r.data),
};
export const automationsApi = createResourceService('/automations');
export const billingApi = {
  invoices: createResourceService('/billing/invoices'),
  subscriptions: createResourceService('/billing/subscriptions'),
  plans: () => apiClient.get('/billing/plans').then(r => r.data),
  usage: () => apiClient.get('/billing/usage').then(r => r.data),
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
