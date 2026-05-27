import { mockDb } from '../utils/mockDb';

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for filtering & search
const applyFilters = (list, { search, searchFields = ['name', 'company', 'email'], filters = {} } = {}) => {
  let result = [...list];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(item => 
      searchFields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }

  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      result = result.filter(item => String(item[key]).toLowerCase() === String(val).toLowerCase());
    }
  });

  return result;
};

// Helper for pagination
const applyPagination = (list, { page = 1, limit = 10 } = {}) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return {
    data: list.slice(startIndex, endIndex),
    total: list.length,
    page,
    limit,
    totalPages: Math.ceil(list.length / limit)
  };
};

// Initial data for new modules if not present in localStorage
const INITIAL_PROJECTS = [
  { id: 'p1', name: 'CyberPulse Security Shield', client: 'CyberPulse Security', status: 'In Progress', health: 'Healthy', progress: 65, value: 75000, deadline: '2026-08-15', owner: 'Curtis Tungsten' },
  { id: 'p2', name: 'CloudScale Cost Reduction', client: 'CloudScale Inc.', status: 'Planning', health: 'Healthy', progress: 12, value: 45000, deadline: '2026-10-01', owner: 'Sarah Jenkins' },
  { id: 'p3', name: 'BioGen API Dev integration', client: 'BioGen Lab', status: 'Stuck', health: 'At Risk', progress: 40, value: 30000, deadline: '2026-07-20', owner: 'Curtis Tungsten' },
];

const INITIAL_AUDIT_LOGS = [
  { id: 'l1', timestamp: '2026-05-26T16:10:00Z', user: 'admin@techtopia.crm', action: 'Update Tenant Settings', resource: 'Tenant', ip: '192.168.1.5', severity: 'Info' },
  { id: 'l2', timestamp: '2026-05-26T15:45:00Z', user: 'curtis@techtopia.crm', action: 'Delete Deal d_92837', resource: 'Pipeline', ip: '192.168.1.12', severity: 'Warning' },
  { id: 'l3', timestamp: '2026-05-26T14:20:00Z', user: 'finance@techtopia.crm', action: 'Generate Invoice INV-2026-002', resource: 'Billing', ip: '10.0.4.150', severity: 'Info' },
  { id: 'l4', timestamp: '2026-05-25T09:12:00Z', user: 'sales@techtopia.crm', action: 'Export Contacts CSV', resource: 'Contacts', ip: '192.168.1.88', severity: 'Danger' },
  { id: 'l5', timestamp: '2026-05-25T08:00:00Z', user: 'system_ai', action: 'Lead Scored: Alice Vance (92/100)', resource: 'AI Engine', ip: '127.0.0.1', severity: 'Info' },
];

const INITIAL_AUTOMATIONS = [
  { id: 'a1', name: 'Auto-assign Tech Leads', trigger: 'Lead Created', condition: 'Source = Web & Tech Size > 100', action: 'Assign to Sarah Jenkins & Send Slack Notify', active: true },
  { id: 'a2', name: 'SLA Escalation support', trigger: 'Ticket Open', condition: 'Priority = High & Unresolved > 2 hours', action: 'Re-assign to Tier-3 support & Email Admin', active: true },
  { id: 'a3', name: 'Invoice Due Reminder', trigger: 'Invoice Overdue', condition: 'Overdue > 5 days', action: 'Send automated email reminder to client finance', active: false },
];

const INITIAL_ACTIVITIES = [
  { id: 'act1', type: 'Email', title: 'Sent Followup proposal', desc: 'Sent customized migration pricing breakdown', user: 'Curtis Tungsten', date: '2026-05-26 15:30', entityId: 'c1' },
  { id: 'act2', type: 'Call', title: 'Discovery Call', desc: 'Discussed API performance requirements', user: 'Sarah Jenkins', date: '2026-05-25 11:00', entityId: 'c2' },
  { id: 'act3', type: 'System', title: 'Deal status update', desc: 'Deal changed: Proposal -> Won', user: 'System AI', date: '2026-05-24 09:15', entityId: 'd5' },
];

const getLocalItem = (key, initial) => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try { return JSON.parse(item); } catch { return initial; }
};

const setLocalItem = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const mockApi = {
  // Contacts
  getContacts: async (params = {}) => {
    await delay();
    const list = mockDb.getContacts();
    const filtered = applyFilters(list, { ...params, searchFields: ['name', 'company', 'email'] });
    return applyPagination(filtered, params);
  },
  addContact: async (data) => {
    await delay(200);
    return mockDb.addContact(data);
  },
  updateContact: async (data) => {
    await delay(200);
    mockDb.updateContact(data);
    return data;
  },
  deleteContact: async (id) => {
    await delay(100);
    mockDb.deleteContact(id);
    return true;
  },

  // Deals / Pipeline
  getDeals: async (params = {}) => {
    await delay();
    const list = mockDb.getDeals();
    const filtered = applyFilters(list, { ...params, searchFields: ['title', 'company'] });
    return applyPagination(filtered, params);
  },
  addDeal: async (data) => {
    await delay(200);
    return mockDb.addDeal(data);
  },
  updateDeal: async (data) => {
    await delay(200);
    mockDb.updateDeal(data);
    return data;
  },
  deleteDeal: async (id) => {
    await delay(100);
    mockDb.deleteDeal(id);
    return true;
  },

  // Tasks
  getTasks: async (params = {}) => {
    await delay();
    const list = mockDb.getTasks();
    const filtered = applyFilters(list, { ...params, searchFields: ['title', 'contactName'] });
    return applyPagination(filtered, params);
  },
  addTask: async (data) => {
    await delay(200);
    return mockDb.addTask(data);
  },
  updateTask: async (data) => {
    await delay(200);
    mockDb.updateTask(data);
    return data;
  },
  deleteTask: async (id) => {
    await delay(100);
    mockDb.deleteTask(id);
    return true;
  },

  // Companies
  getCompanies: async (params = {}) => {
    await delay();
    const list = mockDb.getCompanies();
    const filtered = applyFilters(list, { ...params, searchFields: ['name', 'industry', 'location'] });
    return applyPagination(filtered, params);
  },

  // Invoices
  getInvoices: async (params = {}) => {
    await delay();
    const list = mockDb.getInvoices();
    const filtered = applyFilters(list, { ...params, searchFields: ['id', 'client', 'status'] });
    return applyPagination(filtered, params);
  },

  // Tickets / Support
  getTickets: async (params = {}) => {
    await delay();
    const list = mockDb.getTickets();
    const filtered = applyFilters(list, { ...params, searchFields: ['id', 'subject', 'client', 'priority', 'status'] });
    return applyPagination(filtered, params);
  },
  addTicket: async (data) => {
    await delay(200);
    const tickets = mockDb.getTickets();
    const newTicket = { id: `TK-${Date.now().toString().slice(-4)}`, lastUpdated: 'Just now', ...data };
    tickets.push(newTicket);
    mockDb.saveTickets(tickets);
    return newTicket;
  },
  updateTicket: async (data) => {
    await delay(200);
    const tickets = mockDb.getTickets();
    const idx = tickets.findIndex(t => t.id === data.id);
    if (idx !== -1) {
      tickets[idx] = { ...tickets[idx], ...data, lastUpdated: 'Just now' };
      mockDb.saveTickets(tickets);
      return tickets[idx];
    }
    return null;
  },

  // Projects (Local persistent state)
  getProjects: async (params = {}) => {
    await delay();
    const list = getLocalItem('crm_projects', INITIAL_PROJECTS);
    const filtered = applyFilters(list, { ...params, searchFields: ['name', 'client', 'owner'] });
    return applyPagination(filtered, params);
  },
  addProject: async (data) => {
    await delay(200);
    const list = getLocalItem('crm_projects', INITIAL_PROJECTS);
    const newProject = { id: `p_${Date.now()}`, progress: 0, health: 'Healthy', ...data };
    list.push(newProject);
    setLocalItem('crm_projects', list);
    return newProject;
  },
  updateProject: async (data) => {
    await delay(200);
    const list = getLocalItem('crm_projects', INITIAL_PROJECTS);
    const idx = list.findIndex(p => p.id === data.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setLocalItem('crm_projects', list);
      return list[idx];
    }
    return null;
  },

  // Audit Logs (Read-only for simulation)
  getAuditLogs: async (params = {}) => {
    await delay();
    const list = getLocalItem('crm_audit_logs', INITIAL_AUDIT_LOGS);
    const filtered = applyFilters(list, { ...params, searchFields: ['user', 'action', 'resource', 'severity'] });
    return applyPagination(filtered, params);
  },

  // Automations
  getAutomations: async (params = {}) => {
    await delay();
    const list = getLocalItem('crm_automations', INITIAL_AUTOMATIONS);
    return applyPagination(list, params);
  },
  addAutomation: async (data) => {
    await delay(200);
    const list = getLocalItem('crm_automations', INITIAL_AUTOMATIONS);
    const newItem = { id: `a_${Date.now()}`, active: true, ...data };
    list.push(newItem);
    setLocalItem('crm_automations', list);
    return newItem;
  },
  toggleAutomation: async (id) => {
    await delay(100);
    const list = getLocalItem('crm_automations', INITIAL_AUTOMATIONS);
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx].active = !list[idx].active;
      setLocalItem('crm_automations', list);
      return list[idx];
    }
    return null;
  },

  // Activities
  getActivities: async (params = {}) => {
    await delay();
    const list = getLocalItem('crm_activities', INITIAL_ACTIVITIES);
    return applyPagination(list, params);
  },

  // Profile
  getProfile: async () => {
    await delay(100);
    return mockDb.getProfile();
  },
  updateProfile: async (data) => {
    await delay(200);
    mockDb.updateUserProfile(data);
    return mockDb.getProfile();
  }
};
