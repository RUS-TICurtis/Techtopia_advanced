import { apiClient } from './api';

const mapProjectDto = (p) => ({
  id: p.id,
  name: p.name,
  title: p.name, // Frontend often uses 'title' or 'name' interchangeably for projects
  status: p.status || 'Active',
  progress: p.progressPercentage || 0,
  client: p.customerName || "Internal",
  manager: p.ownerName || "Unassigned",
  startDate: p.startDate ? p.startDate.split('T')[0] : null,
  endDate: p.endDate ? p.endDate.split('T')[0] : null,
  dueDate: p.endDate ? p.endDate.split('T')[0] : null, // Frontend Kanban uses 'dueDate'
  description: p.description || '',
  enableMicrosoftWorkspace: p.enableMicrosoftWorkspace || false,
  budget: 0,
  spent: 0,
  health: p.healthStatus || 'On Track',
});

export const projectsApi = {
  list: async (params) => {
    const response = await apiClient.get('/api/projects', { params });
    const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return data.map(mapProjectDto);
  },
  get: async (id) => {
    const response = await apiClient.get(`/api/projects/${id}`);
    return mapProjectDto(response.data);
  },
  create: async (data) => {
    const toIso = (d) => d ? new Date(d).toISOString() : undefined;
    const backendData = {
      Name: data.title || data.name,
      Description: data.description || null,
      ProjectType: data.projectType || "Client",
      Priority: data.priority || "Medium",
      StartDate: toIso(data.startDate),
      EndDate: toIso(data.dueDate || data.endDate),
      EnableMicrosoftWorkspace: data.enableMicrosoftWorkspace ?? false,
      OwnerId: data.ownerId || undefined,
      CustomerId: data.customerId || undefined
    };
    const response = await apiClient.post('/api/projects', backendData);
    return mapProjectDto(response.data);
  },
  update: async (id, data) => {
    const toIso = (d) => d ? new Date(d).toISOString() : undefined;
    const backendData = {
      Name: data.title || data.name,
      Description: data.description,
      ProjectType: data.projectType || "Client",
      Status: data.status,
      Priority: data.priority || "Medium",
      StartDate: toIso(data.startDate),
      EndDate: toIso(data.dueDate || data.endDate),
      OwnerId: data.ownerId || undefined,
      CustomerId: data.customerId || undefined
    };
    const response = await apiClient.put(`/api/projects/${id}`, backendData);
    return mapProjectDto(response.data);
  },
  delete: async (id) => {
    await apiClient.delete(`/api/projects/${id}`);
    return { success: true };
  }
};
