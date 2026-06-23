import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import auditTrack from '../services/audit/auditService';
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
  contractsApi,
  budgetsApi,
  expensesApi,
  vendorsApi,
  invitationsApi,
  vendorCategoriesApi,
  expenseCategoriesApi,
  usersApi,
  rolesApi,
  tenantsApi,
  permissionsApi,
  accountsApi,
  journalEntriesApi,
  reconciliationApi,
  purchaseRequisitionsApi,
  vendorQuotesApi,
  paymentsApi,
  settlementsApi,
  reportsApi
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      auditTrack.info('Create Lead', 'CRM');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => leadsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      auditTrack.warning('Update Lead', 'CRM');
    },
  });

  const convertMutation = useMutation({
    mutationFn: (id) => leadsApi.convert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      auditTrack.warning('Convert Lead', 'CRM');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      auditTrack.critical('Delete Lead', 'CRM');
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      auditTrack.info('Create Project', 'Projects');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      auditTrack.warning('Update Project', 'Projects');
    },
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
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['invoices'] });

  const query = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => invoicesApi.create(data),
    onSuccess: () => { invalidate(); auditTrack.info('Create Invoice', 'Finance'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => invoicesApi.update(id, data),
    onSuccess: () => { invalidate(); auditTrack.warning('Update Invoice', 'Finance'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => invoicesApi.delete(id),
    onSuccess: () => { invalidate(); auditTrack.critical('Delete Invoice', 'Finance'); },
  });

  // POST /api/v1/finance/invoices/{id}/submit  → Draft → PendingApproval
  const submitMutation = useMutation({
    mutationFn: (id) => invoicesApi.submit(id),
    onSuccess: () => { invalidate(); auditTrack.warning('Submit Invoice', 'Finance'); },
  });

  // POST /api/v1/finance/invoices/{id}/approve  body: { comment, status: "Approved"|"Rejected" }
  const approveMutation = useMutation({
    mutationFn: ({ id, data }) => invoicesApi.approve(id, data),
    onSuccess: (_, { data }) => {
      invalidate();
      const isRejected = data?.status === 'Rejected';
      auditTrack[isRejected ? 'warning' : 'warning'](
        isRejected ? 'Reject Invoice' : 'Approve Invoice',
        'Finance'
      );
    },
  });

  // POST /api/v1/finance/invoices/{id}/payments
  const recordPaymentMutation = useMutation({
    mutationFn: ({ id, data }) => invoicesApi.recordPayment(id, data),
    onSuccess: () => { invalidate(); auditTrack.info('Record Invoice Payment', 'Finance'); },
  });

  return {
    ...query,
    invoices: query.data || [],
    createInvoice: createMutation.mutateAsync,
    updateInvoice: updateMutation.mutateAsync,
    deleteInvoice: deleteMutation.mutateAsync,
    submitInvoice: submitMutation.mutateAsync,
    approveInvoice: approveMutation.mutateAsync,
    recordInvoicePayment: recordPaymentMutation.mutateAsync,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      auditTrack.info('Create Support Ticket', 'Support');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => ticketsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      auditTrack.warning('Update Support Ticket', 'Support');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ticketsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      auditTrack.critical('Delete Support Ticket', 'Support');
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      auditTrack.info('Create Contact', 'CRM');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contactsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      auditTrack.warning('Update Contact', 'CRM');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      auditTrack.critical('Delete Contact', 'CRM');
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      auditTrack.info('Create Company', 'CRM');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => companiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      auditTrack.warning('Update Company', 'CRM');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => companiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      auditTrack.critical('Delete Company', 'CRM');
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      auditTrack.info('Create Opportunity', 'CRM');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => dealsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      auditTrack.warning('Update Opportunity', 'CRM');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dealsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      auditTrack.critical('Delete Opportunity', 'CRM');
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      auditTrack.info('Create Task', 'Workspace');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      auditTrack.warning('Update Task', 'Workspace');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      auditTrack.critical('Delete Task', 'Workspace');
    },
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
  const budgetsQuery = useQuery({
    queryKey: ['financeBudgets'],
    queryFn: () => budgetsApi.list().catch(() => []),
  });

  const paymentsQuery = useQuery({
    queryKey: ['financePayments'],
    queryFn: () => paymentsApi.list().catch(() => []),
  });

  const settlementsQuery = useQuery({
    queryKey: ['financeSettlements'],
    queryFn: () => settlementsApi.list().catch(() => []),
  });

  return {
    overview: null,
    budgets: budgetsQuery.data || [],
    payments: paymentsQuery.data || [],
    settlements: settlementsQuery.data || [],
    isLoading: budgetsQuery.isLoading || paymentsQuery.isLoading || settlementsQuery.isLoading,
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
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['financeOverview'] });
    queryClient.invalidateQueries({ queryKey: ['financeBudgets'] });
  };

  const query = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => budgetsApi.create(data),
    onSuccess: () => { invalidate(); auditTrack.info('Create Budget', 'Finance'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => budgetsApi.update(id, data),
    onSuccess: () => { invalidate(); auditTrack.warning('Update Budget', 'Finance'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => budgetsApi.delete(id),
    onSuccess: () => { invalidate(); auditTrack.critical('Delete Budget', 'Finance'); },
  });

  // POST /api/v1/finance/budgets/{id}/submit  body: { comment }
  const submitMutation = useMutation({
    mutationFn: ({ id, data }) => budgetsApi.submit(id, data),
    onSuccess: () => { invalidate(); auditTrack.warning('Submit Budget', 'Finance'); },
  });

  // POST /api/v1/finance/budgets/{id}/approve  body: { comment }
  const approveMutation = useMutation({
    mutationFn: ({ id, data }) => budgetsApi.approve(id, data),
    onSuccess: () => { invalidate(); auditTrack.warning('Approve Budget', 'Finance'); },
  });

  // POST /api/v1/finance/budgets/{id}/reject  body: { comment }
  const rejectMutation = useMutation({
    mutationFn: ({ id, data }) => budgetsApi.reject(id, data),
    onSuccess: () => { invalidate(); auditTrack.warning('Reject Budget', 'Finance'); },
  });

  // POST /api/v1/finance/budgets/{id}/activate
  const activateMutation = useMutation({
    mutationFn: (id) => budgetsApi.activate(id),
    onSuccess: () => { invalidate(); auditTrack.warning('Activate Budget', 'Finance'); },
  });

  // POST /api/v1/finance/budgets/{id}/close  body: { comment }
  const closeMutation = useMutation({
    mutationFn: ({ id, data }) => budgetsApi.close(id, data),
    onSuccess: () => { invalidate(); auditTrack.warning('Close Budget', 'Finance'); },
  });

  // POST /api/v1/finance/budgets/{id}/cancel
  const cancelMutation = useMutation({
    mutationFn: (id) => budgetsApi.cancel(id),
    onSuccess: () => { invalidate(); auditTrack.warning('Cancel Budget', 'Finance'); },
  });

  // GET /api/v1/finance/budgets/{id}/allocations and /variance
  const createAllocationMutation = useMutation({
    mutationFn: ({ id, data }) => budgetsApi.createAllocation(id, data),
    onSuccess: () => { invalidate(); auditTrack.warning('Create Budget Allocation', 'Finance'); },
  });

  return {
    ...query,
    budgets: query.data || [],
    createBudget: createMutation.mutateAsync,
    updateBudget: updateMutation.mutateAsync,
    deleteBudget: deleteMutation.mutateAsync,
    submitBudget: submitMutation.mutateAsync,
    approveBudget: approveMutation.mutateAsync,
    rejectBudget: rejectMutation.mutateAsync,
    activateBudget: activateMutation.mutateAsync,
    closeBudget: closeMutation.mutateAsync,
    cancelBudget: cancelMutation.mutateAsync,
    listAllocations: budgetsApi.listAllocations,
    createAllocation: createAllocationMutation.mutateAsync,
    getVariance: budgetsApi.variance,
  };
}

// Vendors Hook
export function useVendors() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['vendors'] });

  const query = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => vendorsApi.create(data),
    onSuccess: () => { invalidate(); auditTrack.info('Create Vendor', 'Finance'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vendorsApi.update(id, data),
    onSuccess: () => { invalidate(); auditTrack.warning('Update Vendor', 'Finance'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vendorsApi.delete(id),
    onSuccess: invalidate,
  });

  // Vendor Contacts — GET/POST/PUT/DELETE /api/v1/finance/vendors/{id}/contacts
  const createContactMutation = useMutation({
    mutationFn: ({ id, data }) => vendorsApi.createContact(id, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['vendorContacts', id] }),
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, contactId, data }) => vendorsApi.updateContact(id, contactId, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['vendorContacts', id] }),
  });

  const deleteContactMutation = useMutation({
    mutationFn: ({ id, contactId }) => vendorsApi.deleteContact(id, contactId),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['vendorContacts', id] }),
  });

  // Vendor Contracts — POST /api/v1/finance/vendors/{id}/contracts
  const createContractMutation = useMutation({
    mutationFn: ({ id, data }) => vendorsApi.createContract(id, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['vendorContracts', id] }),
  });

  // Vendor Documents — POST /api/v1/finance/vendors/{id}/documents
  const createDocumentMutation = useMutation({
    mutationFn: ({ id, data }) => vendorsApi.createDocument(id, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['vendorDocuments', id] }),
  });

  return {
    ...query,
    vendors: query.data || [],
    createVendor: createMutation.mutateAsync,
    updateVendor: updateMutation.mutateAsync,
    deleteVendor: deleteMutation.mutateAsync,
    listVendorContacts: vendorsApi.listContacts,
    createVendorContact: createContactMutation.mutateAsync,
    updateVendorContact: updateContactMutation.mutateAsync,
    deleteVendorContact: deleteContactMutation.mutateAsync,
    listVendorContracts: vendorsApi.listContracts,
    createVendorContract: createContractMutation.mutateAsync,
    listVendorDocuments: vendorsApi.listDocuments,
    createVendorDocument: createDocumentMutation.mutateAsync,
  };
}

// Subscriptions Hook
export function useSubscriptions() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => apiClient.get('/api/v1/finance/subscriptions').then(r => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/api/v1/finance/subscriptions/${id}/cancel`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const suspendMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/api/v1/finance/subscriptions/${id}/suspend`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const resumeMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/api/v1/finance/subscriptions/${id}/resume`).then(r => r.data),
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
    queryFn: () => apiClient.get('/api/v1/finance/tax').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/api/v1/finance/tax', data).then(r => r.data),
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
    queryFn: () => settlementsApi.list(),
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
    queryFn: () => apiClient.get('/api/v1/finance/procurement').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/api/v1/finance/procurement', data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement'] }),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/api/v1/finance/procurement/${id}/approve`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procurement'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => apiClient.post(`/api/v1/finance/procurement/${id}/reject`).then(r => r.data),
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
    queryFn: () => paymentsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => paymentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['financeOverview'] });
      queryClient.invalidateQueries({ queryKey: ['financePayments'] });
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, reason }) => paymentsApi.refund(id, reason),
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
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['financeOverview'] });
  };

  const query = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesApi.list(),
  });

  // GET /api/v1/finance/expenses/categories
  const categoriesQuery = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: () => expenseCategoriesApi.list().catch(() => []),
    staleTime: 5 * 60 * 1000,
  });

  // POST /api/v1/finance/expenses  — creates expense in Draft status
  const createMutation = useMutation({
    mutationFn: (data) => expensesApi.create(data),
    onSuccess: invalidate,
  });

  // PUT /api/v1/finance/expenses/{id}  — updates Draft or Rejected expense
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => expensesApi.update(id, data),
    onSuccess: invalidate,
  });

  // POST /api/v1/finance/expenses/{id}/submit  — Draft → PendingApproval
  const submitMutation = useMutation({
    mutationFn: (id) => expensesApi.submit(id),
    onSuccess: invalidate,
  });

  // POST /api/v1/finance/expenses/{id}/approve  body: { decision: "Approved", comment }
  const approveMutation = useMutation({
    mutationFn: ({ id, data }) => expensesApi.approve(id, data),
    onSuccess: invalidate,
  });

  // POST /api/v1/finance/expenses/{id}/reject  body: { decision: "Rejected", comment } (comment required!)
  const rejectMutation = useMutation({
    mutationFn: ({ id, data }) => expensesApi.reject(id, data),
    onSuccess: invalidate,
  });

  // POST /api/v1/finance/expenses/{id}/payment  (singular — not /payments)
  const recordPaymentMutation = useMutation({
    mutationFn: ({ id, data }) => expensesApi.recordPayment(id, data),
    onSuccess: invalidate,
  });

  // POST /api/v1/finance/expenses/{id}/cancel
  const cancelMutation = useMutation({
    mutationFn: (id) => expensesApi.cancel(id),
    onSuccess: invalidate,
  });

  // DELETE /api/v1/finance/expenses/{id}  — only Draft or Rejected
  const deleteMutation = useMutation({
    mutationFn: (id) => expensesApi.delete(id),
    onSuccess: invalidate,
  });

  return {
    ...query,
    expenses: query.data || [],
    categories: categoriesQuery.data || [],
    createExpense: createMutation.mutateAsync,
    updateExpense: updateMutation.mutateAsync,
    submitExpense: submitMutation.mutateAsync,
    approveExpense: approveMutation.mutateAsync,
    rejectExpense: rejectMutation.mutateAsync,
    recordExpensePayment: recordPaymentMutation.mutateAsync,
    cancelExpense: cancelMutation.mutateAsync,
    deleteExpense: deleteMutation.mutateAsync,
  };
}

// Revenue Analytics Hook
export function useRevenueAnalytics() {
  const query = useQuery({
    queryKey: ['revenueAnalytics'],
    queryFn: () => reportsApi.get('revenue-summary'),
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
    queryFn: () => reportsApi.get(type, { start: from, end: to }),
    enabled: !!type,
  });

  return {
    ...query,
    reportData: query.data || null,
  };
}

// Invoice Activities Hook
export function useInvoiceActivities(invoiceId) {
  const query = useQuery({
    queryKey: ['invoiceActivities', invoiceId],
    queryFn: () => invoicesApi.getActivities(invoiceId),
    enabled: !!invoiceId,
  });

  return {
    ...query,
    activities: query.data || [],
  };
}

// Expense Activities Hook
export function useExpenseActivities(expenseId) {
  const query = useQuery({
    queryKey: ['expenseActivities', expenseId],
    queryFn: () => expensesApi.getActivities(expenseId),
    enabled: !!expenseId,
  });

  return {
    ...query,
    activities: query.data || [],
  };
}

// Vendor Categories Hook
export function useVendorCategories() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['vendorCategories'],
    queryFn: () => vendorCategoriesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => vendorCategoriesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendorCategories'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ categoryId, data }) => vendorCategoriesApi.update(categoryId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendorCategories'] }),
  });

  return {
    ...query,
    categories: query.data || [],
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
  };
}

// Users Hook
export function useUsers() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => usersApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return {
    ...query,
    users: query.data || [],
    createUser: createMutation.mutateAsync,
    updateUser: updateMutation.mutateAsync,
    deleteUser: deleteMutation.mutateAsync,
  };
}

// Roles Hook
export function useRoles() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => rolesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => rolesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => rolesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  return {
    ...query,
    roles: query.data || [],
    createRole: createMutation.mutateAsync,
    updateRole: updateMutation.mutateAsync,
    deleteRole: deleteMutation.mutateAsync,
  };
}

// Invitations Hook
export function useInvitations() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['invitationsDevTokens'],
    queryFn: () => invitationsApi.getDevTokens().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data) => invitationsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitationsDevTokens'] }),
  });

  const acceptMutation = useMutation({
    mutationFn: (data) => invitationsApi.accept(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['invitationsDevTokens'] });
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id) => invitationsApi.resend(id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => invitationsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitationsDevTokens'] }),
  });

  return {
    ...query,
    devTokens: query.data || [],
    createInvitation: createMutation.mutateAsync,
    acceptInvitation: acceptMutation.mutateAsync,
    resendInvitation: resendMutation.mutateAsync,
    deleteInvitation: deleteMutation.mutateAsync,
  };
}

// Permissions Hook
export function usePermissions() {
  const query = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.list(),
  });

  return {
    ...query,
    permissions: query.data || [],
  };
}

// Tenants Hook
export function useTenants() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => tenantsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tenantsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tenantsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tenants'] }),
  });

  return {
    ...query,
    tenants: query.data || [],
    createTenant: createMutation.mutateAsync,
    updateTenant: updateMutation.mutateAsync,
    deleteTenant: deleteMutation.mutateAsync,
  };
}

// General Ledger Accounts Hook
export function useAccounts() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['financeAccounts'],
    queryFn: () => accountsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => accountsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeAccounts'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => accountsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['financeAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['financeAccount', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => accountsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financeAccounts'] }),
  });

  return {
    ...query,
    accounts: query.data || [],
    createAccount: createMutation.mutateAsync,
    updateAccount: updateMutation.mutateAsync,
    deleteAccount: deleteMutation.mutateAsync,
  };
}

// Journal Entries Hook
export function useJournalEntries() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => journalEntriesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => journalEntriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['financeAccounts'] });
    },
  });

  return {
    ...query,
    entries: query.data || [],
    createJournalEntry: createMutation.mutateAsync,
  };
}

// Bank Reconciliation Hook
export function useReconciliation() {
  const queryClient = useQueryClient();

  const createStatementMutation = useMutation({
    mutationFn: (data) => reconciliationApi.createStatement(data),
  });

  const reconcileLineMutation = useMutation({
    mutationFn: ({ lineId, data }) => reconciliationApi.reconcileLine(lineId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeAccounts'] });
    },
  });

  return {
    createStatement: createStatementMutation.mutateAsync,
    reconcileLine: reconcileLineMutation.mutateAsync,
  };
}

// Purchase Requisitions Hook
export function usePurchaseRequisitions() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['purchaseRequisitions'],
    queryFn: () => purchaseRequisitionsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => purchaseRequisitionsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseRequisitions'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => purchaseRequisitionsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseRequisitions'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => purchaseRequisitionsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseRequisitions'] }),
  });

  const submitMutation = useMutation({
    mutationFn: (id) => purchaseRequisitionsApi.submit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseRequisitions'] }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, data }) => purchaseRequisitionsApi.approve(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseRequisitions'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, data }) => purchaseRequisitionsApi.reject(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseRequisitions'] }),
  });

  return {
    ...query,
    requisitions: query.data || [],
    createRequisition: createMutation.mutateAsync,
    updateRequisition: updateMutation.mutateAsync,
    deleteRequisition: deleteMutation.mutateAsync,
    submitRequisition: submitMutation.mutateAsync,
    approveRequisition: approveMutation.mutateAsync,
    rejectRequisition: rejectMutation.mutateAsync,
  };
}

// Vendor Quotes Hook
export function useVendorQuotes() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['vendorQuotes'],
    queryFn: () => vendorQuotesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => vendorQuotesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendorQuotes'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vendorQuotesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendorQuotes'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vendorQuotesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendorQuotes'] }),
  });

  const evaluateMutation = useMutation({
    mutationFn: ({ id, data }) => vendorQuotesApi.evaluate(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vendorQuotes'] }),
  });

  const selectMutation = useMutation({
    mutationFn: ({ id, data }) => vendorQuotesApi.select(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorQuotes'] });
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
    },
  });

  return {
    ...query,
    quotes: query.data || [],
    createQuote: createMutation.mutateAsync,
    updateQuote: updateMutation.mutateAsync,
    deleteQuote: deleteMutation.mutateAsync,
    evaluateQuote: evaluateMutation.mutateAsync,
    selectQuote: selectMutation.mutateAsync,
  };
}


