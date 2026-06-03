import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, projectsApi, invoicesApi, ticketsApi, analyticsApi } from '../lib/api';

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

  return {
    ...query,
    leads: query.data || [],
    createLead: createMutation.mutateAsync,
    updateLead: updateMutation.mutateAsync,
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
  const query = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.list(),
  });

  return {
    ...query,
    invoices: query.data || [],
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
