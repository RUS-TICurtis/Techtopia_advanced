import { apiClient as api, getApiBaseUrl } from '../lib/api';

const microsoftIntegrationService = {
  // Initiates the OAuth flow to connect Microsoft Graph
  connectMicrosoftAccount: async () => {
    try {
      const frontendUrl = window.location.origin + '/settings';
      const response = await api.get(`/api/graph/auth/connect?frontendUrl=${encodeURIComponent(frontendUrl)}`);
      if (response.data && response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error("Failed to fetch auth URL", error);
    }
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
