import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  Briefcase, 
  LifeBuoy, 
  Sparkles, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProjects, useInvoices, useTickets } from '../../hooks/useCrmData';
import { Badge } from '@/components/ui/Badge';
import './ClientPortal.css';

export default function ClientDashboard() {
  const user = useAuthStore(state => state.user);
  const companyName = user?.clientCompany || 'CloudScale Inc.';
  const displayCompany = companyName === 'ACME Corp' ? 'CloudScale Inc.' : companyName; // Demowise mapping

  const { projects: allProjects = [] } = useProjects();
  const { invoices: allInvoices = [] } = useInvoices();
  const { tickets: allTickets = [] } = useTickets();

  // Filter projects, invoices, tickets for the company
  const projects = allProjects; // projects are scoped to organization (tenant)
  const invoices = allInvoices.filter(inv => inv.client === displayCompany);
  const tickets = allTickets.filter(t => t.client === displayCompany);

  // Calculations
  const activeProject = useMemo(() => {
    if (projects.length === 0) return { name: 'No active project', progress: 0, status: 'Not Started', description: '' };
    const proj = projects[0];
    const completedMilestones = proj.milestones ? proj.milestones.filter(m => m.completed).length : 0;
    const totalMilestones = proj.milestones ? proj.milestones.length : 0;
    const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : (proj.status === 'Completed' ? 100 : 0);
    return {
      ...proj,
      progress: progressPercent,
    };
  }, [projects]);

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'Paid');
  const unpaidTotal = unpaidInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const activeTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');

  const metrics = [
    { 
      label: 'Deliverable Progress', 
      value: projects.length > 0 ? `${activeProject.progress}%` : '0%', 
      sub: projects.length > 0 ? activeProject.name : 'No active project', 
      icon: Briefcase, 
      color: 'var(--brand-cyan)', 
      link: '/client/projects' 
    },
    { 
      label: 'Outstanding Invoices', 
      value: `$${unpaidTotal.toLocaleString()}`, 
      sub: `${unpaidInvoices.length} invoices pending`, 
      icon: FileText, 
      color: 'var(--brand-magenta)', 
      link: '/client/invoices' 
    },
    { 
      label: 'Active SLA Tickets', 
      value: activeTickets.length, 
      sub: '0 critical blockers', 
      icon: LifeBuoy, 
      color: 'var(--brand-purple)', 
      link: '/client/support' 
    }
  ];

  return (
    <div className="page-container client-portal-page">
      {/* Welcome Banner */}
      <div className="portal-welcome-banner mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="portal-header-title">
              Welcome to Techtopia Hub, {user?.name || 'Client'}! <span className="animate-pulse">âš¡</span>
            </h1>
            <p className="portal-header-subtitle">
              <Building2 size={14} />
              Corporate Workspace for <span className="portal-header-company">{displayCompany}</span>
            </p>
          </div>
          <div className="portal-status-badge">
            <CheckCircle size={14} />
            <span>OPERATIONS NORMAL</span>
          </div>
        </div>
      </div>

      {/* Roster Metrics */}
      <div className="cards-grid-3 mb-6">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <Link 
              key={m.label} 
              to={m.link}
              className="portal-metric-card"
              style={{ borderLeftColor: m.color }}
            >
              <div className="flex justify-between items-start w-full">
                <div className="metric-info">
                  <span className="metric-label">{m.label}</span>
                  <span className="metric-value">{m.value}</span>
                </div>
                <div className="metric-icon-wrapper" style={{ background: `rgba(var(--primary-rgb), 0.08)`, color: m.color }}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-4 flex items-center justify-between w-full">
                <span className="truncate pr-2">{m.sub}</span>
                <ArrowRight size={12} className="text-gray-400 flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Feed vs Quick Actions */}
      <div className="cards-grid-3">
        
        {/* Left Column: Active deliverable detail & feed */}
        <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-6" style={{ gridColumn: 'span 2' }}>
          
          {/* Active project card */}
          {projects.length > 0 ? (
            <div className="portal-panel">
              <div className="portal-panel-header">
                <h3 className="portal-panel-title">
                  <Briefcase size={16} style={{ color: 'var(--brand-cyan)' }} /> Ongoing Project Status
                </h3>
                <Badge variant="success">On Track</Badge>
              </div>

              <h4 className="portal-text-title text-base tracking-tight mb-2">
                {activeProject.name}
              </h4>
              <p className="text-xs portal-text-muted leading-relaxed mb-4">
                {activeProject.description || "Active deliverables cataloged under your corporate workspace."}
              </p>

              {/* Progress gauge */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                  <span>COMPLETION RATE</span>
                  <span style={{ color: 'var(--brand-cyan)', fontFamily: 'var(--font-mono)' }}>{activeProject.progress}%</span>
                </div>
                <div className="portal-progress-bg">
                  <div 
                    className="portal-progress-fill"
                    style={{ width: `${activeProject.progress}%` }}
                  />
                </div>
              </div>

              {/* Milestones checklist */}
              {activeProject.milestones && activeProject.milestones.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-light pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Project Milestones</span>
                  <div className="flex flex-col gap-2">
                    {activeProject.milestones.map((ms, idx) => (
                      <div key={idx} className="portal-bullet-item">
                        <div className="portal-bullet-dot" />
                        <span>{ms.name} {ms.completed ? '(âœ“ Completed)' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="portal-panel text-center text-gray-500 py-12">
              No active deliverables logged.
            </div>
          )}

        </div>

        {/* Right Column: Quick shortcuts & Actions */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions Panel */}
          <div className="portal-panel">
            <div className="portal-panel-header">
              <h3 className="portal-panel-title">
                <Sparkles size={16} style={{ color: 'var(--brand-magenta)' }} /> Workspace Actions
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/client/support" className="btn btn-primary w-full py-3 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-glow">
                <LifeBuoy size={14} /> Open Support Ticket
              </Link>
              <Link to="/client/invoices" className="btn btn-secondary w-full py-3 text-xs font-bold text-center transition-all">
                Pay Outstanding Invoices
              </Link>
              <Link to="/client/contracts" className="btn btn-secondary w-full py-3 text-xs font-bold text-center transition-all">
                Review Active Agreements
              </Link>
            </div>
          </div>

          {/* System Announcement Panel */}
          <div className="portal-announcement">
            <span className="portal-announcement-title">System Update</span>
            Premium visual light/dark theming and neon grid frameworks have been cut over to the client dashboard successfully. Verify metrics inside your portal workspace.
          </div>

        </div>

      </div>
    </div>
  );
}
