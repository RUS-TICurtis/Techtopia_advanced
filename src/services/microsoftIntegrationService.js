import { apiClient as api, getApiBaseUrl } from '../lib/api';

const microsoftIntegrationService = {
  // Initiates the OAuth flow to connect Microsoft Graph
  connectMicrosoftAccount: () => {
    // Redirect the browser directly to the endpoint since it performs an OAuth redirect
    const baseUrl = getApiBaseUrl().replace(/\/$/, ''); // Remove trailing slash if present
    window.location.href = `${baseUrl}/api/graph/auth/connect`;
  },

  // Check if a workspace mapping exists for a specific project
  getProjectWorkspace: async (projectId) => {
    try {
      const response = await api.get(`/api/projects/${projectId}/workspace`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }
};

export default microsoftIntegrationService;
