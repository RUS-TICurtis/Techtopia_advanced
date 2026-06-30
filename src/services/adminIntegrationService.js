import { apiClient as api } from '../lib/api';

const adminIntegrationService = {
  // Get system-wide integration dashboard metrics
  getDashboardMetrics: async () => {
    try {
      const response = await api.get('/api/admin/microsoft/dashboard');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch dashboard metrics", error);
      throw error;
    }
  },

  // Trigger a global sync across all tenants
  forceGlobalSync: async (type) => {
    try {
      const response = await api.post('/api/admin/microsoft/force-global-sync', { type });
      return response.data;
    } catch (error) {
      console.error("Failed to force global sync", error);
      throw error;
    }
  }
};

export default adminIntegrationService;
