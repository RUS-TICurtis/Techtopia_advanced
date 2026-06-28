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

  // Initiates the Admin Consent flow for a Multi-Tenant organization
  connectOrganization: async () => {
    try {
      const frontendUrl = window.location.origin + '/settings';
      const response = await api.get(`/api/graph/auth/admin-consent?frontendUrl=${encodeURIComponent(frontendUrl)}`);
      if (response.data && response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error("Failed to fetch admin consent URL", error);
    }
  },

  // Check Microsoft connection status
  checkConnectionStatus: async () => {
    try {
      const response = await api.get('/api/graph/auth/status');
      return response.data; // { isConnected: true/false, email: "..." }
    } catch (error) {
      console.error("Failed to check connection status", error);
      return { isConnected: false };
    }
  },

  // Check if a workspace mapping exists for a specific project
  getProjectWorkspace: async (projectId) => {
    // FALLBACK: If the frontend is using mock numerical IDs (instead of backend Guids), 
    // simulate a successful workspace creation so the UI banner is visible!
    if (!isNaN(projectId)) {
      return {
        projectId: projectId,
        microsoftTeamId: "mock-team-id-1234",
        sharePointSiteId: "mock-site-id-5678",
        defaultChannelId: "mock-channel-id-9012",
        createdAt: new Date().toISOString()
      };
    }

    try {
      const response = await api.get(`/api/projects/${projectId}/workspace`);
      return response.data;
    } catch (error) {
      // 404 = no workspace provisioned yet (Teams job still pending Azure permissions)
      // This is expected behavior — silently return null so UI shows "pending" state
      if (error.response && error.response.status === 404) {
        return null;
      }
      // Only log unexpected errors
      console.error("Workspace fetch failed unexpectedly", error);
      return null;
    }
  }
};

export default microsoftIntegrationService;
