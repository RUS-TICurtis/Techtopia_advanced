/**
 * Finance Service — Techtopia CRM
 * Axios-based API layer for the Finance Module.
 * All endpoints are tenant-scoped via Authorization header.
 * Default currency: GHS (Ghana Cedis). Multi-currency supported via currencyCode param.
 */
import axios from 'axios';
import { getApiBaseUrl } from '../../lib/api';

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token + tenant ID to every request
api.interceptors.request.use((config) => {
  const apiBase = getApiBaseUrl();
  config.baseURL = apiBase.endsWith('/') ? `${apiBase}finance` : `${apiBase}/finance`;
  
  const token = localStorage.getItem('crm_access_token');
  const tenantId = localStorage.getItem('crm_tenant_id') || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Tenant-Id'] = tenantId;
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
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
          originalRequest.baseURL = apiBase.endsWith('/') ? `${apiBase}finance` : `${apiBase}/finance`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('crm_access_token');
        localStorage.removeItem('crm_refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Currency Utilities ────────────────────────────────────────────────────
export const CURRENCIES = {
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
};
export const DEFAULT_CURRENCY = CURRENCIES.GHS;

export const formatCurrency = (amount, currencyCode = 'GHS') => {
  const currency = CURRENCIES[currencyCode] || DEFAULT_CURRENCY;
  return `${currency.symbol}${Number(amount || 0).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ─── Finance Overview ──────────────────────────────────────────────────────
export const financeService = {
  // Dashboard KPIs
  getOverview: () => api.get('/overview').then(r => r.data),

  // ── Invoices ──────────────────────────────────────────────────────────
  getInvoices: (params = {}) => api.get('/invoices', { params }).then(r => r.data),
  getInvoice: (id) => api.get(`/invoices/${id}`).then(r => r.data),
  createInvoice: (data) => api.post('/invoices', data).then(r => r.data),
  updateInvoice: (id, data) => api.patch(`/invoices/${id}`, data).then(r => r.data),
  deleteInvoice: (id) => api.delete(`/invoices/${id}`).then(r => r.data),
  sendInvoice: (id) => api.post(`/invoices/${id}/send`).then(r => r.data),
  approveInvoice: (id) => api.post(`/invoices/${id}/approve`).then(r => r.data),
  duplicateInvoice: (id) => api.post(`/invoices/${id}/duplicate`).then(r => r.data),
  downloadInvoicePDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }).then(r => r.data),

  // ── Payments ──────────────────────────────────────────────────────────
  getPayments: (params = {}) => api.get('/payments', { params }).then(r => r.data),
  createManualPayment: (data) => api.post('/payments/manual', data).then(r => r.data),
  refundPayment: (id, data) => api.post(`/payments/${id}/refund`, data).then(r => r.data),
  reconcilePayment: (id) => api.post(`/payments/${id}/reconcile`).then(r => r.data),

  // ── Hubtel Gateway ────────────────────────────────────────────────────
  initHubtelPayment: (data) => api.post('/gateways/hubtel/initiate', data).then(r => r.data),
  verifyHubtelPayment: (reference) => api.get(`/gateways/hubtel/verify/${reference}`).then(r => r.data),

  // ── Paystack Gateway ──────────────────────────────────────────────────
  initPaystackPayment: (data) => api.post('/gateways/paystack/initiate', data).then(r => r.data),
  verifyPaystackPayment: (reference) => api.get(`/gateways/paystack/verify/${reference}`).then(r => r.data),

  // ── Subscriptions ────────────────────────────────────────────────────
  getSubscriptionPlans: () => api.get('/subscriptions/plans').then(r => r.data),
  getSubscriptions: (params = {}) => api.get('/subscriptions', { params }).then(r => r.data),
  createSubscription: (data) => api.post('/subscriptions', data).then(r => r.data),
  updateSubscription: (id, data) => api.patch(`/subscriptions/${id}`, data).then(r => r.data),
  cancelSubscription: (id) => api.post(`/subscriptions/${id}/cancel`).then(r => r.data),
  suspendSubscription: (id) => api.post(`/subscriptions/${id}/suspend`).then(r => r.data),
  resumeSubscription: (id) => api.post(`/subscriptions/${id}/resume`).then(r => r.data),
  upgradeSubscription: (id, planId) => api.post(`/subscriptions/${id}/upgrade`, { planId }).then(r => r.data),

  // ── Expenses ─────────────────────────────────────────────────────────
  getExpenses: (params = {}) => api.get('/expenses', { params }).then(r => r.data),
  getExpenseCategories: () => api.get('/expenses/categories').then(r => r.data),
  submitExpense: (data) => api.post('/expenses', data).then(r => r.data),
  updateExpense: (id, data) => api.patch(`/expenses/${id}`, data).then(r => r.data),
  approveExpense: (id) => api.post(`/expenses/${id}/approve`).then(r => r.data),
  rejectExpense: (id, reason) => api.post(`/expenses/${id}/reject`, { reason }).then(r => r.data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`).then(r => r.data),

  // ── Vendors ───────────────────────────────────────────────────────────
  getVendors: (params = {}) => api.get('/vendors', { params }).then(r => r.data),
  getVendor: (id) => api.get(`/vendors/${id}`).then(r => r.data),
  createVendor: (data) => api.post('/vendors', data).then(r => r.data),
  updateVendor: (id, data) => api.patch(`/vendors/${id}`, data).then(r => r.data),
  deleteVendor: (id) => api.delete(`/vendors/${id}`).then(r => r.data),

  // ── Purchase Orders ───────────────────────────────────────────────────
  getPurchaseOrders: (params = {}) => api.get('/procurement', { params }).then(r => r.data),
  createPurchaseOrder: (data) => api.post('/procurement', data).then(r => r.data),
  updatePurchaseOrder: (id, data) => api.patch(`/procurement/${id}`, data).then(r => r.data),
  approvePurchaseOrder: (id) => api.post(`/procurement/${id}/approve`).then(r => r.data),
  rejectPurchaseOrder: (id) => api.post(`/procurement/${id}/reject`).then(r => r.data),

  // ── Budgets ───────────────────────────────────────────────────────────
  getBudgets: (params = {}) => api.get('/budgets', { params }).then(r => r.data),
  getBudget: (id) => api.get(`/budgets/${id}`).then(r => r.data),
  createBudget: (data) => api.post('/budgets', data).then(r => r.data),
  updateBudget: (id, data) => api.patch(`/budgets/${id}`, data).then(r => r.data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`).then(r => r.data),

  // ── Reports ───────────────────────────────────────────────────────────
  getReport: (type, params = {}) => api.get(`/reports/${type}`, { params }).then(r => r.data),
  exportReport: (type, format, params = {}) => api.get(`/reports/${type}/export`, { params: { ...params, format }, responseType: 'blob' }).then(r => r.data),
  getRevenueSummary: (params = {}) => api.get('/reports/revenue-summary', { params }).then(r => r.data),

  // ── Settlements ───────────────────────────────────────────────────────
  getSettlements: (params = {}) => api.get('/settlements', { params }).then(r => r.data),

  // ── Tax Records ───────────────────────────────────────────────────────
  getTaxRecords: (params = {}) => api.get('/tax', { params }).then(r => r.data),
  createTaxRecord: (data) => api.post('/tax', data).then(r => r.data),

  // ── AI Finance Agent ──────────────────────────────────────────────────
  getAIInsights: () => api.get('/ai/insights').then(r => r.data),
  getOverdueAlerts: () => api.get('/ai/overdue-alerts').then(r => r.data),
  askAIAgent: (query) => api.post('/ai/chat', { query }).then(r => r.data),
  getExecutiveSummary: () => api.get('/ai/executive-summary').then(r => r.data),
  getRevenueForecast: (months = 3) => api.get('/ai/revenue-forecast', { params: { months } }).then(r => r.data),
  getChurnPredictions: () => api.get('/ai/churn-predictions').then(r => r.data),
};

export default financeService;
