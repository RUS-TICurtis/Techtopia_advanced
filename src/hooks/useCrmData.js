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
