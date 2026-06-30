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
      const response = await api.get('/api/tenants/current/microsoft/status');
      return response.data;
    } catch (error) {
      console.error("Failed to check connection status", error);
      return { isConnected: false };
    }
  },

  // Disconnect Microsoft account
  disconnectMicrosoftAccount: async () => {
    try {
      const response = await api.post('/api/tenants/current/microsoft/disconnect');
      return response.data;
    } catch (error) {
      console.error("Failed to disconnect", error);
      throw error;
    }
  },

  // Trigger manual sync
  triggerSync: async (type) => {
    try {
      const response = await api.post('/api/tenants/current/microsoft/sync', { type });
      return response.data;
    } catch (error) {
      console.error("Failed to trigger sync", error);
      throw error;
    }
  },

  // ─── Directory ────────────────────────────────────────────────────────────

  // Get all synced Entra ID users with presence and profile data
  getDirectoryUsers: async () => {
    try {
      const response = await api.get('/api/tenants/current/microsoft/directory/users');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch directory users", error);
      return [];
    }
  },

  // Get all synced Azure AD Groups / Departments
  getDirectoryGroups: async () => {
    try {
      const response = await api.get('/api/tenants/current/microsoft/directory/groups');
      return response.data;
    } catch (error) {
      console.error("Failed to fetch directory groups", error);
      return [];
    }
  },

  // ─── Calendar ────────────────────────────────────────────────────────────

  // Get all synced calendar events for a date range
  getCalendarEvents: async (from, to) => {
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from.toISOString());
      if (to) params.append('to', to.toISOString());
      const response = await api.get(`/api/tenants/current/microsoft/calendar/events?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch calendar events", error);
      return [];
    }
  },

  // ─── Per-Employee ─────────────────────────────────────────────────────────

  // Get live presence and profile photo for a specific employee
  getEmployeePresence: async (employeeId) => {
    try {
      const response = await api.get(`/api/tenants/current/microsoft/employees/${employeeId}/presence`);
      return response.data;
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Failed to fetch employee presence", error);
      }
      return null;
    }
  },

  // Get upcoming calendar events for a specific employee
  getEmployeeCalendar: async (employeeId) => {
    try {
      const response = await api.get(`/api/tenants/current/microsoft/employees/${employeeId}/calendar`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch employee calendar", error);
      return [];
    }
  },

  // ─── Workspace helpers ────────────────────────────────────────────────────

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
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error("Workspace fetch failed unexpectedly", error);
      return null;
    }
  }
};

export default microsoftIntegrationService;
