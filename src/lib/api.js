/**
 * Axios API Client — Techtopia CRM Hub
 * Abstracts all HTTP calls. Swap mock → real by changing BASE_URL.
 */
import axios from 'axios';

// ─── Config ───────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5102/';

export function getApiBaseUrl() {
  const savedUrl = localStorage.getItem('crm_api_url');
  if (savedUrl) {
    return savedUrl.endsWith('/') ? savedUrl : `${savedUrl}/`;
  }
  
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5102/';
  return envUrl.endsWith('/') ? envUrl : `${envUrl}/`;
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor — attach JWT + tenant ─────────────
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('crm_access_token');
    const tenantId = localStorage.getItem('crm_tenant_id') || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['Tenant-Id'] = tenantId;
    config.headers['X-Tenant-ID'] = tenantId; // Needed by ProjectEndpoints.cs
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
          const apiBase = getApiBaseUrl();
          const { data } = await axios.post(`${apiBase}api/v1/auth/refresh`, {
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
          // Sync base URL of the retried request
          originalRequest.baseURL = apiBase;
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

// ─── Generic CRUD factories ────────────────────────────────
/**
 * Create a scoped resource service (PATCH update)
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

/**
 * Create a PUT-scoped resource service
 * @param {string} path - e.g. '/api/v1/finance/budgets'
 */
export function createPutResourceService(path) {
  return {
    list: (params) => apiClient.get(path, { params }).then(r => r.data),
    get: (id) => apiClient.get(`${path}/${id}`).then(r => r.data),
    create: (data) => apiClient.post(path, data).then(r => r.data),
    update: (id, data) => apiClient.put(`${path}/${id}`, data).then(r => r.data),
    delete: (id) => apiClient.delete(`${path}/${id}`).then(r => r.data),
  };
}

// ─── Mock CRUD Helper & Datasets ──────────────────────────
const MOCK_CONTACTS = [
  { id: 1, name: "Alice Vance", company: "CloudScale Inc.", email: "alice@cloudscale.com", phone: "+1 (555) 234-5678", status: "In Progress", value: 45000, notes: "Prefers email connection. Requires SOC2 documentation for proposal.", owner: "Curtis Miller" },
  { id: 2, name: "Robert Chen", company: "Nexus Corp", email: "robert@nexus.com", phone: "+1 (555) 876-5432", status: "Qualified", value: 85000, notes: "Key decision maker. Interested in CRM + Finance General Ledger integration.", owner: "Curtis Miller" },
  { id: 3, name: "Sarah Jenkins", company: "Apex Media", email: "sarah@apex.com", phone: "+1 (555) 345-6789", status: "Won", value: 120000, notes: "Contract signed. Onboarding starts next month.", owner: "Curtis Miller" },
  { id: 4, name: "John Doe", company: "Techtopia Technologies", email: "john@techtopia.crm", phone: "+1 (555) 987-6543", status: "New", value: 15000, notes: "Inquired via trade show booth.", owner: "Curtis Miller" }
];

const MOCK_COMPANIES = [
  { id: 1, name: "CloudScale Inc.", industry: "Cloud Infrastructure", website: "https://cloudscale.com", revenue: "$50M", employees: 250 },
  { id: 2, name: "Nexus Corp", industry: "Financial Services", website: "https://nexuscorp.io", revenue: "$120M", employees: 550 },
  { id: 3, name: "Apex Media", industry: "Digital Advertising", website: "https://apexmedia.co", revenue: "$15M", employees: 80 },
  { id: 4, name: "Techtopia Technologies", industry: "Software Engineering", website: "https://techtopia.crm", revenue: "$5M", employees: 35 }
];

const MOCK_DEALS = [
  { id: 1, name: "SaaS License Renewal", amount: 45000, stage: "Proposal", closeDate: "2026-07-15", company: { id: 1, name: "CloudScale Inc." }, contact: { id: 1, name: "Alice Vance" } },
  { id: 2, name: "AI Copilot Integration", amount: 85000, stage: "Qualified", closeDate: "2026-08-30", company: { id: 2, name: "Nexus Corp" }, contact: { id: 2, name: "Robert Chen" } },
  { id: 3, name: "Enterprise CRM License Expansion", amount: 120000, stage: "Won", closeDate: "2026-06-01", company: { id: 3, name: "Apex Media" }, contact: { id: 3, name: "Sarah Jenkins" } },
  { id: 4, name: "Marketing Suite Expansion", amount: 15000, stage: "Lead", closeDate: "2026-09-10", company: { id: 4, name: "Techtopia Technologies" }, contact: { id: 4, name: "John Doe" } }
];

const MOCK_PROJECTS = [
  { id: 1, name: "Cloud Migration Phase 2", status: "Active", progress: 65, client: "CloudScale Inc.", manager: "Curtis Miller", startDate: "2026-05-01", endDate: "2026-08-30" },
  { id: 2, name: "SOC2 Audit Compliance Readiness", status: "Active", progress: 20, client: "Techtopia Technologies", manager: "Curtis Miller", startDate: "2026-06-01", endDate: "2026-09-15" },
  { id: 3, name: "Nexus HR Portal Redesign", status: "Planning", progress: 0, client: "Nexus Corp", manager: "Curtis Miller", startDate: "2026-07-01", endDate: "2026-11-30" }
];

const MOCK_TASKS = [
  { id: 1, title: "Call CloudScale prospect", priority: "High", status: "Pending", dueDate: "2026-06-25", description: "Follow up on SOC2 compliance requirement notes." },
  { id: 2, title: "Prepare Nexus proposal", priority: "Medium", status: "Completed", dueDate: "2026-06-10", description: "Draft formal integration timeline for GL modules." },
  { id: 3, title: "Audit ledger entries", priority: "High", status: "In Progress", dueDate: "2026-06-20", description: "Reconcile June bank statement draft imports." }
];

const MOCK_TICKETS = [
  { id: 1, subject: "MFA code not received", priority: "Urgent", status: "Open", category: "Authentication", createdBy: "John Doe", assignee: "Support Team", description: "Super admin logins are bypassing, but new users fail to receive bypass messages." },
  { id: 2, subject: "Invoice dispute INV-024", priority: "High", status: "In Progress", category: "Billing", createdBy: "Alice Vance", assignee: "Finance Team", description: "Tax calculation has 0.5% deviation compared to manual ledger entries." },
  { id: 3, subject: "Add new sales rep seat", priority: "Low", status: "Closed", category: "Configuration", createdBy: "Sarah Jenkins", assignee: "IT Helpdesk", description: "Provisioned new seat for regional lead under standard permission roles." }
];

const MOCK_AUDIT_LOGS = [
  { id: "a1", timestamp: new Date(Date.now() - 500000).toISOString(), actor: "admin@techtopia.crm", user: "admin@techtopia.crm", action: "User Login", module: "System", ip: "192.168.1.45", severity: "Info" },
  { id: "a2", timestamp: new Date(Date.now() - 1000000).toISOString(), actor: "admin@techtopia.crm", user: "admin@techtopia.crm", action: "Update Profile", module: "Users", ip: "192.168.1.45", severity: "Info" },
  { id: "a3", timestamp: new Date(Date.now() - 5000000).toISOString(), actor: "sales@techtopia.crm", user: "sales@techtopia.crm", action: "Convert Lead", module: "CRM", ip: "192.168.1.102", severity: "Info" },
  { id: "a4", timestamp: new Date(Date.now() - 12000000).toISOString(), actor: "finance@techtopia.crm", user: "finance@techtopia.crm", action: "Approve Budget", module: "Finance", ip: "192.168.1.88", severity: "Warning" },
  { id: "a5", timestamp: new Date(Date.now() - 18000000).toISOString(), actor: "system", user: "system", action: "Rotate Token", module: "Auth", ip: "127.0.0.1", severity: "Info" },
  { id: "a6", timestamp: new Date(Date.now() - 25000000).toISOString(), actor: "admin@techtopia.crm", user: "admin@techtopia.crm", action: "Register Tenant", module: "System", ip: "192.168.1.45", severity: "Danger" }
];

const MOCK_PAYMENTS = [
  { id: 1, paymentNumber: "PMT-001", invoiceId: "INV-001", amount: 15000, currency: "USD", paymentMethod: "CreditCard", paymentDate: "2026-06-05T10:00:00Z", status: "Success" },
  { id: 2, paymentNumber: "PMT-002", invoiceId: "INV-002", amount: 45000, currency: "USD", paymentMethod: "ACH", paymentDate: "2026-06-12T14:30:00Z", status: "Success" }
];

const MOCK_SETTLEMENTS = [
  { id: 1, settlementNumber: "STL-001", amount: 60000, currency: "USD", settlementDate: "2026-06-13T02:00:00Z", bankAccount: "Chase Operations ...1234", transactionCount: 2, status: "Settled" }
];

function createMockResourceService(storageKey, defaultData) {
  const getStorageKey = () => {
    const tenantId = localStorage.getItem('crm_tenant_id') || 'default';
    return `${storageKey}_${tenantId}`;
  };

  const getItems = () => {
    const key = getStorageKey();
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(data);
  };
  
  const saveItems = (items) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(items));
  };

  return {
    list: async (params) => {
      return getItems();
    },
    get: async (id) => {
      const items = getItems();
      const item = items.find(i => String(i.id) === String(id));
      if (!item) throw new Error("Not Found");
      return item;
    },
    create: async (data) => {
      const items = getItems();
      const newId = Math.floor(Math.random() * 1000000) + 1;
      const newItem = { id: newId, ...data, createdAt: new Date().toISOString() };
      items.push(newItem);
      saveItems(items);
      return newItem;
    },
    update: async (id, data) => {
      const items = getItems();
      const idx = items.findIndex(i => String(i.id) === String(id));
      if (idx === -1) throw new Error("Not Found");
      items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
      saveItems(items);
      return items[idx];
    },
    delete: async (id) => {
      const items = getItems();
      const filtered = items.filter(i => String(i.id) !== String(id));
      saveItems(filtered);
      return { success: true };
    }
  };
}

// ─── Typed Service Modules ────────────────────────────────

export const authApi = {
  login: (credentials) => apiClient.post('/api/v1/auth/login', credentials).then(r => r.data),
  logout: () => apiClient.post('/api/v1/auth/logout').then(r => r.data),
  refresh: (token, refreshToken) => apiClient.post('/api/v1/auth/refresh', { token, refreshToken }).then(r => r.data),
  me: () => apiClient.get('/api/v1/users/me').then(r => r.data),
  updateProfile: (data) => apiClient.put('/api/v1/users/me', data).then(r => r.data),
  uploadProfileImage: (formData) => apiClient.post('/api/v1/users/me/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
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

export const invitationsApi = {
  create: (data) => apiClient.post('/api/v1/invitations', data).then(r => r.data),
  getDevTokens: () => apiClient.get('/api/v1/invitations/dev-tokens').then(r => r.data),
  accept: (data) => apiClient.post('/api/v1/invitations/accept', data).then(r => r.data),
  resend: (id) => apiClient.post(`/api/v1/invitations/${id}/resend`).then(r => r.data),
  delete: (id) => apiClient.delete(`/api/v1/invitations/${id}`).then(r => r.data),
};

export const leadsApi = {
  ...createPutResourceService('/api/v1/leads'),
  convert: (id, data = {}) => apiClient.post(`/api/v1/leads/${id}/convert`, data).then(r => r.data),
  qualify: (id, data) => apiClient.post(`/api/v1/leads/${id}/qualify`, data).then(r => r.data),
  assign: (id, data) => apiClient.post(`/api/v1/leads/${id}/assign`, data).then(r => r.data),
  getNotes: (id) => apiClient.get(`/api/v1/leads/${id}/notes`).then(r => r.data),
  addNote: (id, data) => apiClient.post(`/api/v1/leads/${id}/notes`, data).then(r => r.data),
  getActivities: (id) => apiClient.get(`/api/v1/leads/${id}/activities`).then(r => r.data),
  addActivity: (id, data) => apiClient.post(`/api/v1/leads/${id}/activities`, data).then(r => r.data),
};

export const contactsApi = createPutResourceService('/api/v1/crm/contacts');
export const companiesApi = createPutResourceService('/api/v1/crm/companies');
export const dealsApi = createPutResourceService('/api/v1/crm/opportunities');
export const clientsApi = contactsApi;

export const tasksApi = createMockResourceService('crm_tasks', MOCK_TASKS);
export const ticketsApi = createMockResourceService('crm_tickets', MOCK_TICKETS);


export const invoicesApi = {
  ...createPutResourceService('/api/v1/finance/invoices'),
  submit: (id) => apiClient.post(`/api/v1/finance/invoices/${id}/submit`).then(r => r.data),
  approve: (id, data) => apiClient.post(`/api/v1/finance/invoices/${id}/approve`, data).then(r => r.data),
  recordPayment: (id, data) => apiClient.post(`/api/v1/finance/invoices/${id}/payments`, data).then(r => r.data),
  getActivities: (id) => apiClient.get(`/api/v1/finance/invoices/${id}/activities`).then(r => r.data),
};

export const budgetsApi = {
  ...createPutResourceService('/api/v1/finance/budgets'),
  submit: (id, data) => apiClient.post(`/api/v1/finance/budgets/${id}/submit`, data).then(r => r.data),
  approve: (id, data) => apiClient.post(`/api/v1/finance/budgets/${id}/approve`, data).then(r => r.data),
  reject: (id, data) => apiClient.post(`/api/v1/finance/budgets/${id}/reject`, data).then(r => r.data),
  activate: (id) => apiClient.post(`/api/v1/finance/budgets/${id}/activate`).then(r => r.data),
  close: (id, data) => apiClient.post(`/api/v1/finance/budgets/${id}/close`, data).then(r => r.data),
  cancel: (id) => apiClient.post(`/api/v1/finance/budgets/${id}/cancel`).then(r => r.data),
  listAllocations: (id) => apiClient.get(`/api/v1/finance/budgets/${id}/allocations`).then(r => r.data),
  createAllocation: (id, data) => apiClient.post(`/api/v1/finance/budgets/${id}/allocations`, data).then(r => r.data),
  variance: (id) => apiClient.get(`/api/v1/finance/budgets/${id}/variance`).then(r => r.data),
};

export const expensesApi = {
  ...createPutResourceService('/api/v1/finance/expenses'),
  submit: (id) => apiClient.post(`/api/v1/finance/expenses/${id}/submit`).then(r => r.data),
  approve: (id, data) => apiClient.post(`/api/v1/finance/expenses/${id}/approve`, data).then(r => r.data),
  reject: (id, data) => apiClient.post(`/api/v1/finance/expenses/${id}/reject`, data).then(r => r.data),
  recordPayment: (id, data) => apiClient.post(`/api/v1/finance/expenses/${id}/payment`, data).then(r => r.data),
  getActivities: (id) => apiClient.get(`/api/v1/finance/expenses/${id}/activities`).then(r => r.data),
  cancel: (id) => apiClient.post(`/api/v1/finance/expenses/${id}/cancel`).then(r => r.data),
};

export const vendorsApi = {
  ...createPutResourceService('/api/v1/finance/vendors'),
  listContacts: (id) => apiClient.get(`/api/v1/finance/vendors/${id}/contacts`).then(r => r.data),
  createContact: (id, data) => apiClient.post(`/api/v1/finance/vendors/${id}/contacts`, data).then(r => r.data),
  updateContact: (id, contactId, data) => apiClient.put(`/api/v1/finance/vendors/${id}/contacts/${contactId}`, data).then(r => r.data),
  deleteContact: (id, contactId) => apiClient.delete(`/api/v1/finance/vendors/${id}/contacts/${contactId}`).then(r => r.data),
  listContracts: (id) => apiClient.get(`/api/v1/finance/vendors/${id}/contracts`).then(r => r.data),
  createContract: (id, data) => apiClient.post(`/api/v1/finance/vendors/${id}/contracts`, data).then(r => r.data),
  listDocuments: (id) => apiClient.get(`/api/v1/finance/vendors/${id}/documents`).then(r => r.data),
  createDocument: (id, data) => apiClient.post(`/api/v1/finance/vendors/${id}/documents`, data).then(r => r.data),
};

export const vendorCategoriesApi = {
  list: () => apiClient.get('/api/v1/finance/vendor-categories').then(r => r.data),
  create: (data) => apiClient.post('/api/v1/finance/vendor-categories', data).then(r => r.data),
  update: (categoryId, data) => apiClient.put(`/api/v1/finance/vendor-categories/${categoryId}`, data).then(r => r.data),
};

export const expenseCategoriesApi = {
  list: () => apiClient.get('/api/v1/finance/expenses/categories').then(r => r.data),
};

export const contractsApi = createPutResourceService('/api/v1/finance/contracts');
export const teamApi = createResourceService('/api/v1/hr/employees');
export const departmentsApi = createPutResourceService('/api/v1/hr/departments');


export const analyticsApi = {
  summary: async (params) => {
    return {
      leadsCount: 142,
      opportunitiesValue: 515000,
      conversionRate: 64.5,
      activeDealsCount: 18,
      monthlyRevenue: 125000,
      expensesTotal: 42000,
      pendingApprovals: 5,
      recentActivity: [
        { id: 1, action: "Lead converted", details: "Alice Vance converted to opportunity", timestamp: new Date().toISOString() },
        { id: 2, action: "Budget approved", details: "Q3 Marketing budget approved ($75,000)", timestamp: new Date(Date.now() - 3600000).toISOString() }
      ]
    };
  },
  revenue: async (params) => {
    return {
      totalRevenue: 285000,
      targetRevenue: 300000,
      monthlyData: [
        { month: 'Jan', revenue: 35000, expenses: 12000 },
        { month: 'Feb', revenue: 42000, expenses: 15000 },
        { month: 'Mar', revenue: 58000, expenses: 18000 },
        { month: 'Apr', revenue: 48000, expenses: 16000 },
        { month: 'May', revenue: 62000, expenses: 22000 },
        { month: 'Jun', revenue: 75000, expenses: 24000 }
      ]
    };
  },
  sales: async (params) => {
    return [
      { agent: 'Curtis Miller', deals: 12, value: 320000 },
      { agent: 'Sarah Jenkins', deals: 8, value: 195000 }
    ];
  },
  forecast: async (params) => {
    return {
      weightedPipeline: 437750,
      totalPipeline: 515000,
      confidenceScore: 85
    };
  }
};

export const paymentsApi = {
  list: async () => {
    const data = localStorage.getItem('crm_payments');
    if (!data) {
      localStorage.setItem('crm_payments', JSON.stringify(MOCK_PAYMENTS));
      return MOCK_PAYMENTS;
    }
    return JSON.parse(data);
  },
  create: async (data) => {
    const payments = localStorage.getItem('crm_payments') ? JSON.parse(localStorage.getItem('crm_payments')) : MOCK_PAYMENTS;
    const newId = payments.length + 1;
    const newPayment = {
      id: newId,
      paymentNumber: `PMT-00${newId}`,
      invoiceId: data.invoiceId || "INV-NEW",
      amount: data.amount || 0,
      currency: data.currency || "USD",
      paymentMethod: data.paymentMethod || "CreditCard",
      paymentDate: new Date().toISOString(),
      status: "Success"
    };
    payments.push(newPayment);
    localStorage.setItem('crm_payments', JSON.stringify(payments));
    return newPayment;
  },
  refund: async (id, reason) => {
    const payments = localStorage.getItem('crm_payments') ? JSON.parse(localStorage.getItem('crm_payments')) : MOCK_PAYMENTS;
    const idx = payments.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
      payments[idx].status = "Refunded";
      payments[idx].refundReason = reason;
      localStorage.setItem('crm_payments', JSON.stringify(payments));
      return payments[idx];
    }
    throw new Error("Payment Not Found");
  }
};

export const settlementsApi = {
  list: async () => {
    const data = localStorage.getItem('crm_settlements');
    if (!data) {
      localStorage.setItem('crm_settlements', JSON.stringify(MOCK_SETTLEMENTS));
      return MOCK_SETTLEMENTS;
    }
    return JSON.parse(data);
  }
};

export const reportsApi = {
  get: async (type, params) => {
    if (type === 'revenue-summary') {
      return {
        totalRevenue: 285000,
        targetRevenue: 300000,
        monthlyData: [
          { month: 'Jan', revenue: 35000, expenses: 12000 },
          { month: 'Feb', revenue: 42000, expenses: 15000 },
          { month: 'Mar', revenue: 58000, expenses: 18000 },
          { month: 'Apr', revenue: 48000, expenses: 16000 },
          { month: 'May', revenue: 62000, expenses: 22000 },
          { month: 'Jun', revenue: 75000, expenses: 24000 }
        ]
      };
    }
    if (type === 'balance-sheet') {
      return {
        assets: [
          { name: "Cash & Equivalents", amount: 145000 },
          { name: "Accounts Receivable", amount: 65000 },
          { name: "Prepaid Expenses", amount: 8000 }
        ],
        liabilities: [
          { name: "Accounts Payable", amount: 24000 },
          { name: "Accrued Liabilities", amount: 12000 }
        ],
        equity: [
          { name: "Retained Earnings", amount: 182000 }
        ]
      };
    }
    return {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      generatedAt: new Date().toISOString(),
      data: [
        { label: "Data Point A", value: 120 },
        { label: "Data Point B", value: 240 }
      ]
    };
  }
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
  invoices: createPutResourceService('/api/v1/finance/invoices'),
  subscriptions: createPutResourceService('/api/v1/finance/subscriptions'),
  plans: () => apiClient.get('/api/v1/finance/subscriptions/plans').then(r => r.data),
  usage: () => apiClient.get('/api/v1/finance/subscriptions/usage').then(r => r.data),
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



export const permissionsApi = {
  list: () => apiClient.get('/api/v1/permissions').then(r => r.data),
};

export const accountsApi = {
  ...createPutResourceService('/api/v1/finance/accounts'),
};

export const journalEntriesApi = {
  list: (params) => apiClient.get('/api/v1/finance/journal-entries', { params }).then(r => r.data),
  get: (id) => apiClient.get(`/api/v1/finance/journal-entries/${id}`).then(r => r.data),
  create: (data) => apiClient.post('/api/v1/finance/journal-entries', data).then(r => r.data),
};

export const reconciliationApi = {
  createStatement: (data) => apiClient.post('/api/v1/finance/reconciliation/statements', data).then(r => r.data),
  reconcileLine: (lineId, data) => apiClient.post(`/api/v1/finance/reconciliation/lines/${lineId}/reconcile`, data).then(r => r.data),
};

export const purchaseRequisitionsApi = {
  ...createPutResourceService('/api/v1/finance/purchase-requisitions'),
  submit: (id) => apiClient.post(`/api/v1/finance/purchase-requisitions/${id}/submit`).then(r => r.data),
  approve: (id, data) => apiClient.post(`/api/v1/finance/purchase-requisitions/${id}/approve`, data).then(r => r.data),
  reject: (id, data) => apiClient.post(`/api/v1/finance/purchase-requisitions/${id}/reject`, data).then(r => r.data),
};

export const vendorQuotesApi = {
  ...createPutResourceService('/api/v1/finance/vendor-quotes'),
  evaluate: (id, data) => apiClient.post(`/api/v1/finance/vendor-quotes/${id}/evaluate`, data).then(r => r.data),
  select: (id, data) => apiClient.post(`/api/v1/finance/vendor-quotes/${id}/select`, data).then(r => r.data),
};

// ---------------------------------------------------------
// Inventory API
// ---------------------------------------------------------

export const inventoryApi = {
  listProducts: () => apiClient.get('/api/v1/inventory/products').then(r => r.data),
  createProduct: (data) => apiClient.post('/api/v1/inventory/products', data).then(r => r.data),
};

export const assetsApi = {
  list: () => apiClient.get('/api/v1/assets').then(r => r.data),
  create: (data) => apiClient.post('/api/v1/assets', data).then(r => r.data),
  assign: (data) => apiClient.post('/api/v1/assets/assign', data).then(r => r.data),
  returnAsset: (id, data) => apiClient.post(`/api/v1/assets/${id}/return`, data).then(r => r.data),
};

export default apiClient;
