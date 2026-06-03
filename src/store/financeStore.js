/**
 * Finance Store — Techtopia CRM
 * Zustand store for Finance module state management.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      // ── Currency ────────────────────────────────────────────────────
      activeCurrency: 'GHS',
      setActiveCurrency: (code) => set({ activeCurrency: code }),

      // ── Invoice State ───────────────────────────────────────────────
      selectedInvoice: null,
      invoiceFilters: { status: '', dateFrom: '', dateTo: '', search: '' },
      setSelectedInvoice: (invoice) => set({ selectedInvoice: invoice }),
      setInvoiceFilters: (filters) => set({ invoiceFilters: { ...get().invoiceFilters, ...filters } }),
      clearInvoiceFilters: () => set({ invoiceFilters: { status: '', dateFrom: '', dateTo: '', search: '' } }),

      // ── Payment State ───────────────────────────────────────────────
      selectedPayment: null,
      paymentFilters: { gateway: '', status: '', dateFrom: '', dateTo: '' },
      setSelectedPayment: (payment) => set({ selectedPayment: payment }),
      setPaymentFilters: (filters) => set({ paymentFilters: { ...get().paymentFilters, ...filters } }),

      // ── Expense State ───────────────────────────────────────────────
      selectedExpense: null,
      expenseFilters: { status: '', type: '', dateFrom: '', dateTo: '' },
      setSelectedExpense: (expense) => set({ selectedExpense: expense }),
      setExpenseFilters: (filters) => set({ expenseFilters: { ...get().expenseFilters, ...filters } }),

      // ── Budget State ────────────────────────────────────────────────
      selectedBudget: null,
      setSelectedBudget: (budget) => set({ selectedBudget: budget }),

      // ── Vendor State ────────────────────────────────────────────────
      selectedVendor: null,
      setSelectedVendor: (vendor) => set({ selectedVendor: vendor }),

      // ── AI Agent Conversation ────────────────────────────────────────
      agentMessages: [],
      agentLoading: false,
      addAgentMessage: (message) => set((state) => ({
        agentMessages: [...state.agentMessages, message],
      })),
      clearAgentMessages: () => set({ agentMessages: [] }),
      setAgentLoading: (loading) => set({ agentLoading: loading }),

      // ── Report State ────────────────────────────────────────────────
      reportType: 'revenue',
      reportDateRange: {
        from: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().slice(0, 10),
        to: new Date().toISOString().slice(0, 10),
      },
      setReportType: (type) => set({ reportType: type }),
      setReportDateRange: (range) => set({ reportDateRange: range }),

      // ── UI State ────────────────────────────────────────────────────
      showCreateInvoiceModal: false,
      showCreateExpenseModal: false,
      showCreateBudgetModal: false,
      showCreateVendorModal: false,
      showCreatePaymentModal: false,
      showCreatePOModal: false,
      setModal: (modal, open) => set({ [modal]: open }),
    }),
    {
      name: 'techtopia-finance-store',
      partialize: (state) => ({
        activeCurrency: state.activeCurrency,
        reportType: state.reportType,
        reportDateRange: state.reportDateRange,
        agentMessages: state.agentMessages.slice(-50), // persist last 50 messages
      }),
    }
  )
);

export default useFinanceStore;
