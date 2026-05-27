import { useState } from 'react';
import { 
  Building2, 
  Briefcase, 
  Calendar, 
  User, 
  ArrowLeft,
  Clock,
  Flag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Badge from '../../components/ui/Badge';
import './ClientPortal.css';

const INITIAL_PROJECTS = [
  {
    id: "p1",
    title: "Quantum Core Cloud Migration",
    company: "CloudScale Inc.",
    progress: 74,
    health: "On Track",
    startDate: "2026-05-01",
    dueDate: "2026-07-15",
    owner: "Curtis Miller",
    milestones: ["Database replication", "Network security audit", "API Gateway cutover"],
    description: "Full cutover of Cyberdyne core databases and authentication protocols to advanced secure cloud nodes."
  }
];

export default function ClientProjects() {
  const user = useAuthStore(state => state.user);
  const companyName = user?.clientCompany || 'CloudScale Inc.';
  const displayCompany = companyName === 'ACME Corp' ? 'CloudScale Inc.' : companyName;

  const [projects] = useState(() => {
    const saved = localStorage.getItem('crm_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const clientProjects = projects.filter(p => p.company === displayCompany);

  const getHealthBadgeVariant = (h) => {
    switch (h) {
      case 'On Track': return 'success';
      case 'At Risk': return 'warning';
      case 'Off Track': return 'error';
      case 'Completed': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="page-container client-portal-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Link to="/client" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span style={{ color: 'var(--brand-cyan)' }}>⚡</span> Deliverables Portfolio
          </h1>
          <p className="page-subtitle">Track real-time engineering progress, milestone updates and health check markers</p>
        </div>
      </div>

      <div className="cards-grid-2">
        {clientProjects.map(proj => (
          <div key={proj.id} className="project-portfolio-card premium-panel flex flex-col gap-4 p-5">
            
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="portal-text-title text-base tracking-tight truncate">
                  {proj.title}
                </h3>
                <p className="text-xs portal-text-muted font-semibold flex items-center gap-1.5 mt-1 truncate">
                  <Building2 size={12} className="text-gray-500" />
                  {proj.company}
                </p>
              </div>
              <Badge variant={getHealthBadgeVariant(proj.health)}>
                {proj.health}
              </Badge>
            </div>

            <p className="text-xs portal-text-muted leading-relaxed">
              {proj.description || "Active deliverables cataloged under your corporate workspace."}
            </p>

            {/* Progress gauge */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-500">
                <span>COMPLETION RATE</span>
                <span style={{ color: 'var(--brand-cyan)', fontFamily: 'var(--font-mono)' }}>{proj.progress}%</span>
              </div>
              <div className="portal-progress-bg">
                <div 
                  className="portal-progress-fill"
                  style={{ width: `${proj.progress}%` }}
                />
              </div>
            </div>

            {/* Owner metadata */}
            <div className="portal-info-box">
              <User size={14} style={{ color: 'var(--brand-purple)' }} />
              <span>Project Account Manager: <span className="font-semibold" style={{ color: 'var(--text-title)' }}>{proj.owner}</span></span>
            </div>

            {/* Milestone checklist */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Flag size={12} style={{ color: 'var(--brand-cyan)' }} /> Active Delivery Milestones
              </span>
              <div className="flex flex-col gap-2">
                {proj.milestones && proj.milestones.map((ms, idx) => (
                  <div key={idx} className="portal-bullet-item">
                    <div className="portal-bullet-dot" />
                    <span>{ms}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-light pt-4 mt-auto" style={{ borderTop: '1px solid var(--border-light)' }}>
              <div className="flex items-center gap-1 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <Calendar size={12} style={{ color: 'var(--brand-cyan)' }} />
                <span>Start: {proj.startDate}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <Clock size={12} style={{ color: 'var(--brand-magenta)' }} />
                <span>Target: {proj.dueDate}</span>
              </div>
            </div>

          </div>
        ))}

        {clientProjects.length === 0 && (
          <div className="portal-panel text-center text-gray-500 py-12 col-span-2">
            No active deliverables registered.
          </div>
        )}
      </div>
    </div>
  );
}
