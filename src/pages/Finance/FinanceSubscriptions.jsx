import React, { useState } from 'react';
import {
  Users, TrendingUp, TrendingDown, CheckCircle, AlertCircle,
  Plus, X, ArrowUpCircle, ArrowDownCircle, PauseCircle,
  PlayCircle, XCircle, Zap, Star, Shield
} from 'lucide-react';
import { formatCurrency } from '../../services/finance/financeService';
import './Finance.css';

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, period: 'month', color: '#627496',
    features: ['Up to 3 users', '5 projects', 'Basic CRM', 'Email support'],
    badge: null, mrr: 0, seats: 14,
  },
  {
    id: 'pro', name: 'Pro', price: 499, period: 'month', color: '#01FDF6',
    features: ['Up to 25 users', 'Unlimited projects', 'Full CRM suite', 'Priority support', 'AI Assistant'],
    badge: 'Popular', mrr: 124750, seats: 250,
  },
  {
    id: 'business', name: 'Business', price: 1299, period: 'month', color: '#8A4FFF',
    features: ['Up to 100 users', 'Custom workflows', 'Advanced analytics', 'Dedicated success manager', 'White labeling'],
    badge: null, mrr: 389700, seats: 300,
  },
  {
    id: 'enterprise', name: 'Enterprise', price: null, period: 'custom', color: '#E4FF1A',
    features: ['Unlimited users', 'Custom integrations', 'SLA guarantees', '24/7 phone support', 'On-prem option'],
    badge: 'Best Value', mrr: 650000, seats: 8,
  },
];

const MOCK_SUBSCRIPTIONS = [
  { id: 'SUB-001', tenant: 'Acme Corp', plan: 'Business', seats: 45, billing: 'Monthly', amount: 1299, status: 'active', nextBilling: '2026-07-01', since: '2025-01-15' },
  { id: 'SUB-002', tenant: 'BioGen Labs', plan: 'Pro', seats: 12, billing: 'Annual', amount: 4990, status: 'active', nextBilling: '2027-01-10', since: '2026-01-10' },
  { id: 'SUB-003', tenant: 'CyberPulse', plan: 'Enterprise', seats: 120, billing: 'Annual', amount: 60000, status: 'active', nextBilling: '2027-03-01', since: '2026-03-01' },
  { id: 'SUB-004', tenant: 'DataVault Inc', plan: 'Pro', seats: 8, billing: 'Monthly', amount: 499, status: 'suspended', nextBilling: '—', since: '2025-08-12' },
  { id: 'SUB-005', tenant: 'EcoLogistics', plan: 'Free', seats: 3, billing: '—', amount: 0, status: 'active', nextBilling: '—', since: '2026-02-20' },
  { id: 'SUB-006', tenant: 'FinTech Hub', plan: 'Business', seats: 22, billing: 'Monthly', amount: 1299, status: 'cancelled', nextBilling: '—', since: '2025-11-05' },
];

const STATUS_CLASSES = {
  active: 'badge-success',
  suspended: 'badge-warning',
  cancelled: 'badge-danger',
  trial: 'badge-info',
};

export default function FinanceSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionModal, setActionModal] = useState(null); // { type, sub }

  const metrics = {
    mrr: PLANS.reduce((s, p) => s + p.mrr, 0),
    arr: PLANS.reduce((s, p) => s + p.mrr * 12, 0),
    active: subscriptions.filter(s => s.status === 'active').length,
    churnRisk: subscriptions.filter(s => s.status === 'suspended').length,
  };

  const handleAction = (action, subId) => {
    const statusMap = { activate: 'active', suspend: 'suspended', cancel: 'cancelled' };
    setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, status: statusMap[action] || s.status } : s));
    setActionModal(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscriptions</h1>
          <p className="page-subtitle">Manage SaaS plans, tenant billing cycles, and subscription lifecycle</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /><span>New Subscription</span>
          </button>
        </div>
      </div>

      {/* MRR / ARR Metrics */}
      <div className="finance-kpi-grid">
        {[
          { label: 'Monthly Recurring Revenue', value: formatCurrency(metrics.mrr), color: '#21FA90', bg: 'rgba(33,250,144,0.1)', icon: TrendingUp, change: '+14.2%', up: true },
          { label: 'Annual Recurring Revenue', value: formatCurrency(metrics.arr), color: '#01FDF6', bg: 'rgba(1,253,246,0.1)', icon: TrendingUp, change: '+14.2%', up: true },
          { label: 'Active Subscriptions', value: metrics.active, color: '#8A4FFF', bg: 'rgba(138,79,255,0.1)', icon: CheckCircle, change: '+3 this month', up: true },
          { label: 'Churn Risk', value: `${metrics.churnRisk} accounts`, color: '#FF47DA', bg: 'rgba(255,71,218,0.1)', icon: AlertCircle, change: 'Action needed', up: false },
        ].map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="finance-kpi-card card">
              <div className="finance-kpi-icon" style={{ background: m.bg, color: m.color }}><Icon size={20} /></div>
              <div className="finance-kpi-content">
                <span className="finance-kpi-label">{m.label}</span>
                <span className="finance-kpi-value" style={{ fontSize: 18 }}>{m.value}</span>
                <div className="finance-kpi-meta">
                  <span className={`finance-kpi-change ${m.up ? 'up' : 'down'}`}>
                    {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {m.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Bar */}
      <div className="finance-tab-bar">
        {['subscriptions', 'plans'].map(tab => (
          <button key={tab} className={`finance-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="subscription-plans-grid">
          {PLANS.map(plan => (
            <div key={plan.id} className={`subscription-plan-card ${plan.id === 'pro' ? 'featured' : ''}`}>
              {plan.badge && (
                <span className="subscription-plan-badge" style={{ background: `${plan.color}20`, color: plan.color }}>
                  {plan.badge}
                </span>
              )}
              <div>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
                  {plan.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span className="subscription-plan-price" style={{ color: plan.color }}>
                    {plan.price === null ? 'Custom' : plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                  </span>
                  {plan.price > 0 && <span className="subscription-plan-period">/{plan.period}</span>}
                </div>
              </div>
              <ul className="subscription-plan-features">
                {plan.features.map(f => (
                  <li key={f} className="subscription-plan-feature">
                    <CheckCircle size={13} style={{ color: plan.color, flexShrink: 0 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Active seats</span><span className="font-semibold" style={{ color: plan.color }}>{plan.seats}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>MRR</span><span className="font-semibold" style={{ color: 'var(--success)' }}>{formatCurrency(plan.mrr)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="card table-container" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tenant</th>
                <th>Plan</th>
                <th>Seats</th>
                <th>Billing</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Next Billing</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(sub => (
                <tr key={sub.id}>
                  <td><span className="font-mono text-xs" style={{ color: 'var(--brand-cyan)' }}>{sub.id}</span></td>
                  <td className="font-semibold">{sub.tenant}</td>
                  <td>
                    <span className="badge badge-sm badge-info">{sub.plan}</span>
                  </td>
                  <td className="text-sm">
                    <span className="flex items-center gap-1"><Users size={12} /> {sub.seats}</span>
                  </td>
                  <td className="text-xs text-muted">{sub.billing}</td>
                  <td className="font-semibold">{sub.amount === 0 ? '—' : formatCurrency(sub.amount)}</td>
                  <td>
                    <span className={`badge badge-sm ${STATUS_CLASSES[sub.status]}`}>{sub.status}</span>
                  </td>
                  <td className="text-xs text-muted">{sub.nextBilling}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      {sub.status === 'active' && (
                        <>
                          <button className="btn-icon" title="Upgrade" onClick={() => setActionModal({ type: 'upgrade', sub })}><ArrowUpCircle size={14} /></button>
                          <button className="btn-icon" title="Suspend" onClick={() => setActionModal({ type: 'suspend', sub })}><PauseCircle size={14} /></button>
                          <button className="btn-icon" title="Cancel" onClick={() => setActionModal({ type: 'cancel', sub })}><XCircle size={14} /></button>
                        </>
                      )}
                      {sub.status === 'suspended' && (
                        <button className="btn-icon" title="Resume" onClick={() => handleAction('activate', sub.id)}><PlayCircle size={14} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ textTransform: 'capitalize' }}>{actionModal.type} Subscription</h2>
              <button className="btn-icon" onClick={() => setActionModal(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Are you sure you want to <strong>{actionModal.type}</strong> the subscription for <strong>{actionModal.sub.tenant}</strong>?
                {actionModal.type === 'cancel' && ' This action cannot be undone.'}
              </p>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setActionModal(null)}>Go Back</button>
                <button
                  className="btn btn-primary"
                  style={{ background: actionModal.type === 'cancel' ? 'var(--error)' : undefined }}
                  onClick={() => handleAction(actionModal.type === 'suspend' ? 'suspend' : actionModal.type === 'cancel' ? 'cancel' : 'activate', actionModal.sub.id)}
                >
                  Confirm {actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
