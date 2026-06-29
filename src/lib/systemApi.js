import { apiClient } from './api';

export const auditApi = {
  list: async (params) => {
    const response = await apiClient.get('/api/v1/system/audit-logs', { params });
    return response.data; // { data: [], total, page, pageSize }
  },
  export: async (params) => {
    const response = await apiClient.get('/api/v1/system/audit-logs/export', { 
      params, 
      responseType: 'blob' 
    });
    return response.data;
  }
};

export const tenantsApi = {
  list: (params) => apiClient.get('/api/v1/system/tenants', { params }).then(r => r.data),
  get: (id) => apiClient.get(`/api/v1/system/tenants/${id}`).then(r => r.data),
  create: (data) => apiClient.post('/api/v1/system/tenants', data).then(r => r.data),
  update: (id, data) => apiClient.patch(`/api/v1/system/tenants/${id}`, data).then(r => r.data),
  delete: (id) => apiClient.delete(`/api/v1/system/tenants/${id}`).then(r => r.data),
};
