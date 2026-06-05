import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  leadsApi, 
  projectsApi, 
  invoicesApi, 
  ticketsApi, 
  analyticsApi, 
  contactsApi, 
  companiesApi, 
  dealsApi, 
  tasksApi, 
  auditApi, 
  notificationsApi,
  apiClient,
  contractsApi
} from '../lib/api';

// Leads Hook
export function useLeads() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => leadsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => leadsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const convertMutation = useMutation({
    mutationFn: (id) => leadsApi.convert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => leadsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  return {
    ...query,
    leads: query.data || [],
    createLead: createMutation.mutateAsync,
    updateLead: updateMutation.mutateAsync,
    convertLead: convertMutation.mutateAsync,
    deleteLead: deleteMutation.mutateAsync,
  };
}

// Projects Hook
export function useProjects() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => projectsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  return {
    ...query,
    projects: query.data || [],
    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
  };
}

// Invoices Hook
export function useInvoices() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => invoicesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => invoicesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => invoicesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const sendMutation = useMutation({
    mutationFn: (id) => invoicesApi.send(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => invoicesApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => invoicesApi.duplicate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  return {
    ...query,
    invoices: query.data || [],
    createInvoice: createMutation.mutateAsync,
    updateInvoice: updateMutation.mutateAsync,
    deleteInvoice: deleteMutation.mutateAsync,
    sendInvoice: sendMutation.mutateAsync,
    approveInvoice: approveMutation.mutateAsync,
    duplicateInvoice: duplicateMutation.mutateAsync,
  };
}

// Tickets Hook
export function useTickets() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => ticketsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => ticketsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ticketsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });

  return {
    ...query,
    tickets: query.data || [],
    createTicket: createMutation.mutateAsync,
    updateTicket: updateMutation.mutateAsync,
    deleteTicket: deleteMutation.mutateAsync,
  };
}

// Dashboard Summary Hook
export function useDashboardSummary() {
  const query = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => analyticsApi.summary(),
  });

  return {
    ...query,
    summary: query.data || null,
  };
}

// Contacts Hook
export function useContacts() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => contactsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contactsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contactsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  return {
    ...query,
    contacts: query.data || [],
    createContact: createMutation.mutateAsync,
    updateContact: updateMutation.mutateAsync,
    deleteContact: deleteMutation.mutateAsync,
  };
}

// Companies Hook
export function useCompanies() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['companies'],
    queryFn: () => companiesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => companiesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => companiesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => companiesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });

  return {
    ...query,
    companies: query.data || [],
    createCompany: createMutation.mutateAsync,
    updateCompany: updateMutation.mutateAsync,
    deleteCompany: deleteMutation.mutateAsync,
  };
}

// Opportunities (Deals) Hook
export function useOpportunities() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => dealsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => dealsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['opportunities'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => dealsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['opportunities'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dealsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['opportunities'] }),
  });

  return {
    ...query,
    opportunities: query.data || [],
    createOpportunity: createMutation.mutateAsync,
    updateOpportunity: updateMutation.mutateAsync,
    deleteOpportunity: deleteMutation.mutateAsync,
  };
}

// Tasks Hook
export function useTasks() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => tasksApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tasksApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return {
    ...query,
    tasks: query.data || [],
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
  };
}

// Audit Logs Hook
export function useAuditLogs() {
  const query = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => auditApi.list(),
  });

  return {
    ...query,
    logs: query.data || [],
  };
}

// Communications Hook
export function useCommunications() {
  const queryClient = useQueryClient();
  
  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: () => apiClient.get('/api/communications/conversations').then(r => r.data),
  });

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/api/communications/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return {
    conversations: conversationsQuery.data || [],
    isLoadingConversations: conversationsQuery.isLoading,
    notifications: notificationsQuery.data || [],
    isLoadingNotifications: notificationsQuery.isLoading,
    markNotificationRead: markNotificationReadMutation.mutateAsync,
  };
}

// Finance Summary Hook
export function useFinanceSummary() {
  const overviewQuery = useQuery({
    queryKey: ['financeOverview'],
    queryFn: () => apiClient.get('/finance/overview').then(r => r.data),
  });

  const budgetsQuery = useQuery({
    queryKey: ['financeBudgets'],
    queryFn: () => apiClient.get('/finance/budgets').then(r => r.data),
  });

  const paymentsQuery = useQuery({
    queryKey: ['financePayments'],
    queryFn: () => apiClient.get('/finance/payments').then(r => r.data),
  });

  const settlementsQuery = useQuery({
    queryKey: ['financeSettlements'],
    queryFn: () => apiClient.get('/finance/settlements').then(r => r.data),
  });

  return {
    overview: overviewQuery.data || null,
    budgets: budgetsQuery.data || [],
    payments: paymentsQuery.data || [],
    settlements: settlementsQuery.data || [],
    isLoading: overviewQuery.isLoading || budgetsQuery.isLoading || paymentsQuery.isLoading || settlementsQuery.isLoading,
  };
}

// Contracts Hook
export function useContracts() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractsApi.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contractsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => contractsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });

  return {
    ...query,
    contracts: query.data || [],
    createContract: createMutation.mutateAsync,
    updateContract: updateMutation.mutateAsync,
  };
}

// Conversation Messages Hook
export function useConversationMessages(conversationId) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversationMessages', conversationId],
    queryFn: () => apiClient.get(`/api/communications/conversations/${conversationId}/messages`).then(r => r.data),
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content) => apiClient.post(`/api/communications/conversations/${conversationId}/messages`, { content }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversationMessages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    ...query,
    messages: query.data || [],
    sendMessage: sendMessageMutation.mutateAsync,
  };
}

// Budgets Hook
export function useBudgets() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['budgets'],
    queryFn: () => apiClient.get('/finance/budgets').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/finance/budgets', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['financeOverview'] });
      queryClient.invalidateQueries({ queryKey: ['financeBudgets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/finance/budgets/${id}`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['financeOverview'] });
      queryClient.invalidateQueries({ queryKey: ['financeBudgets'] });
    },
  });

  return {
    ...query,
    budgets: query.data || [],
    createBudget: createMutation.mutateAsync,
    deleteBudget: deleteMutation.mutateAsync,
  };
}

// Vendors Hook
export function useVendors() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['vendors'],
    queryFn: () => apiClient.get('/finance/vendors').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/finance/vendors', data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.patch(`/finance/vendors/${id}`, data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/finance/vendors/${id}`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendors'] }),
  });

  return {
    ...query,
    vendors: query.data || [],
    createVendor: createMutation.mutateAsync,
    updateVendor: updateMutation.mutateAsync,
    deleteVendor: deleteMutation.mutateAsync,
  };
}

// Subscriptions Hook
export function useSubscriptions() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => apiClient.get('/finance/subscriptions').then(r => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/finance/subscriptions/${id}/cancel`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const suspendMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/finance/subscriptions/${id}/suspend`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const resumeMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/finance/subscriptions/${id}/resume`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  return {
    ...query,
    subscriptions: query.data || [],
    cancelSubscription: cancelMutation.mutateAsync,
    suspendSubscription: suspendMutation.mutateAsync,
    resumeSubscription: resumeMutation.mutateAsync,
  };
}

// Tax Records Hook
export function useTaxRecords() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['taxRecords'],
    queryFn: () => apiClient.get('/finance/tax').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/finance/tax', data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taxRecords'] }),
  });

  return {
    ...query,
    records: query.data || [],
    createRecord: createMutation.mutateAsync,
  };
}

// Settlements Hook
export function useSettlements() {
  const query = useQuery({
    queryKey: ['settlements'],
    queryFn: () => apiClient.get('/finance/settlements').then(r => r.data),
  });

  return {
    ...query,
    settlements: query.data || [],
  };
}

// Procurement Hook
export function useProcurement() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['procurement'],
    queryFn: () => apiClient.get('/finance/procurement').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/finance/procurement', data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/finance/procurement/${id}/approve`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/finance/procurement/${id}/reject`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement'] }),
  });

  return {
    ...query,
    pos: query.data || [],
    createPurchaseOrder: createMutation.mutateAsync,
    approvePurchaseOrder: approveMutation.mutateAsync,
    rejectPurchaseOrder: rejectMutation.mutateAsync,
  };
}

// Payments Hook
export function usePayments() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['payments'],
    queryFn: () => apiClient.get('/finance/payments').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/finance/payments/manual', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['financeOverview'] });
      queryClient.invalidateQueries({ queryKey: ['financePayments'] });
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, reason }) => apiClient.post(`/finance/payments/${id}/refund`, { reason }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['financeOverview'] });
    },
  });

  return {
    ...query,
    payments: query.data || [],
    createPayment: createMutation.mutateAsync,
    refundPayment: refundMutation.mutateAsync,
  };
}

// Expenses Hook
export function useExpenses() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['expenses'],
    queryFn: () => apiClient.get('/finance/expenses').then(r => r.data),
  });

  const submitMutation = useMutation({
    mutationFn: (data) => apiClient.post('/finance/expenses', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financeOverview'] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/finance/expenses/${id}/approve`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financeOverview'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => apiClient.post(`/finance/expenses/${id}/reject`, { reason }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financeOverview'] });
    },
  });

  return {
    ...query,
    expenses: query.data || [],
    submitExpense: submitMutation.mutateAsync,
    approveExpense: approveMutation.mutateAsync,
    rejectExpense: rejectMutation.mutateAsync,
  };
}

// Revenue Analytics Hook
export function useRevenueAnalytics() {
  const query = useQuery({
    queryKey: ['revenueAnalytics'],
    queryFn: () => apiClient.get('/finance/reports/revenue-summary').then(r => r.data),
  });

  return {
    ...query,
    revenueData: query.data || null,
  };
}

// Financial Report Hook
export function useFinancialReport(type, from, to) {
  const query = useQuery({
    queryKey: ['financialReport', type, from, to],
    queryFn: () => apiClient.get(`/finance/reports/${type}`, { params: { start: from, end: to } }).then(r => r.data),
    enabled: !!type,
  });

  return {
    ...query,
    reportData: query.data || null,
  };
}

