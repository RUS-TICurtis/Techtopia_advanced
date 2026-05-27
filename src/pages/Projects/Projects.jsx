import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Target, 
  Sparkles, 
  Building2, 
  TrendingUp, 
  User, 
  FolderKanban, 
  Clock, 
  X, 
  BarChart2, 
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  MoreVertical
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { showToast } from '../../components/ui/Toast';
import './Projects.css';

const INITIAL_PROJECTS = [
  {
    id: "p1",
    title: "Quantum Core Cloud Migration",
    company: "CloudScale Inc.",
    progress: 74,
    health: "On Track",
    budget: 45000,
    spent: 32000,
    startDate: "2026-05-01",
    dueDate: "2026-07-15",
    owner: "Curtis Miller",
    milestones: ["Database replication", "Network security audit", "API Gateway cuts"],
    description: "Full cutover of Cyberdyne core databases and authentication protocols to advanced secure cloud nodes."
  },
  {
    id: "p2",
    title: "AI Genomics Sequencer Integration",
    company: "BioGen Lab",
    progress: 38,
    health: "At Risk",
    budget: 95000,
    spent: 60000,
    startDate: "2026-04-10",
    dueDate: "2026-06-30",
    owner: "Sarah Jenkins",
    milestones: ["API deployment", "Genomic mapping verify", "SLA validation"],
    description: "Deployment of machine learning pipelines to accelerate gene identification workloads with target 200ms SLAs."
  },
  {
    id: "p3",
    title: "Wayne Secure Dashboard",
    company: "Wayne Enterprises",
    progress: 15,
    health: "Off Track",
    budget: 180000,
    spent: 85000,
    startDate: "2026-05-10",
    dueDate: "2026-08-01",
    owner: "Curtis Miller",
    milestones: ["Security handshake", "Multi-tenant logic", "Role matrix mapping"],
    description: "Premium enterprise dashboards with ironclad permission gating, MFA, and military-grade encryption integrations."
  },
  {
    id: "p4",
    title: "Bespoke Glassmorphism UI",
    company: "Stark Industries",
    progress: 100,
    health: "Completed",
    budget: 120000,
    spent: 115000,
    startDate: "2026-03-01",
    dueDate: "2026-05-20",
    owner: "Tony Stark",
    milestones: ["Grid layout", "Neon brand setup", "Vite production compile"],
    description: "Beautiful Dark Mode premium dashboards following standard modular CSS design patterns and micro-animations."
  }
];

export default function Projects() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('crm_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  useEffect(() => {
    localStorage.setItem('crm_projects', JSON.stringify(projects));
  }, [projects]);

  const [activeHealthFilter, setActiveHealthFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  // Form states for creating project
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [budget, setBudget] = useState('');
  const [spent, setSpent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [health, setHealth] = useState('On Track');
  const [owner, setOwner] = useState('Curtis Miller');
  const [description, setDescription] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!title || !company) return;

    const newProject = {
      id: "p_" + Date.now(),
      title,
      company,
      progress: 0,
      health,
      budget: parseFloat(budget) || 0,
      spent: parseFloat(spent) || 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner,
      milestones: ["Initialize workspace", "Discovery audit"],
      description
    };

    setProjects([newProject, ...projects]);
    setIsAddModalOpen(false);

    // Reset fields
    setTitle(''); setCompany(''); setBudget(''); setSpent('');
    setStartDate(''); setDueDate(''); setHealth('On Track'); setDescription('');

    showToast('Project Created', `Project "${title}" has been successfully added.`, 'success');
  };

  const getHealthBadgeVariant = (h) => {
    switch (h) {
      case 'On Track': return 'success';
      case 'At Risk': return 'warning';
      case 'Off Track': return 'error';
      case 'Completed': return 'info';
      default: return 'neutral';
    }
  };

  const filteredProjects = projects.filter(p => {
    if (activeHealthFilter === 'All') return true;
    return p.health === activeHealthFilter;
  });

  return (
    <div className="page-container projects-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span className="text-[#21FA90]">⚡</span> Project Portfolio
          </h1>
          <p className="page-subtitle">Track project health, progress bars, budgets, and milestones</p>
        </div>
        <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Health Tabs */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          {['All', 'On Track', 'At Risk', 'Off Track', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveHealthFilter(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                activeHealthFilter === tab 
                  ? 'bg-[#21FA90] border-[#21FA90] text-[#0a0f1e] shadow-glow font-black' 
                  : 'bg-[#0f1629]/40 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab}
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono">
                {tab === 'All' ? projects.length : projects.filter(p => p.health === tab).length}
              </span>
            </button>
          ))}
        </div>
        
        {/* Navigation Buttons for Subtree */}
        <div className="flex gap-2">
          <Link to="/projects/board" className="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 border-gray-800 text-gray-400 hover:text-white">
            <FolderKanban size={14} /> Kanban Board
          </Link>
          <Link to="/projects/timeline" className="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 border-gray-800 text-gray-400 hover:text-white">
            <Clock size={14} /> Timeline Chart
          </Link>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map(proj => {
          const budgetPercent = proj.budget > 0 ? Math.min(100, Math.floor((proj.spent / proj.budget) * 100)) : 0;
          return (
            <div key={proj.id} className="project-portfolio-card card premium-card flex flex-col gap-4 p-5 border border-gray-800/80 bg-[#0f1629]/40 backdrop-blur-md">
              
              {/* Header: Title and Health */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-extrabold text-base tracking-tight truncate hover:text-[#01FDF6] transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold flex items-center gap-1.5 mt-0.5 truncate">
                    <Building2 size={12} className="text-gray-500" />
                    {proj.company}
                  </p>
                </div>
                <Badge variant={getHealthBadgeVariant(proj.health)}>
                  {proj.health}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {proj.description || "No project overview description recorded."}
              </p>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                  <span>COMPLETION RATE</span>
                  <span className="text-[#01FDF6] font-mono">{proj.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-900 border border-gray-850 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#8A4FFF] to-[#01FDF6] rounded-full transition-all duration-500"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-[#0a0f1e]/80 border border-gray-850 rounded-xl text-xs text-gray-300">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">BUDGET CONVERSION</span>
                  <span className="font-mono text-white font-extrabold text-xs">
                    ${proj.spent.toLocaleString()} <span className="text-gray-500">/ ${proj.budget.toLocaleString()}</span>
                  </span>
                  <span className="text-[9px] text-gray-500 mt-0.5 font-bold">Spent {budgetPercent}% of allocation</span>
                </div>
                <div className="flex flex-col gap-0.5 border-l border-gray-850 pl-4">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">PORTFOLIO OWNER</span>
                  <span className="text-xs text-gray-300 font-semibold flex items-center gap-1.5 mt-0.5">
                    <User size={12} className="text-[#8A4FFF]" />
                    {proj.owner}
                  </span>
                </div>
              </div>

              {/* Milestones list tags */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">ACTIVE MILESTONES</span>
                <div className="flex flex-wrap gap-1.5">
                  {proj.milestones.map((ms, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-gray-900 border border-gray-850 text-[10px] text-gray-400 font-medium">
                      {ms}
                    </span>
                  ))}
                </div>
              </div>

              {/* Date & Timers Footer */}
              <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-850/50 pt-4 mt-auto">
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-[#01FDF6]" />
                  <span>Due: {proj.dueDate}</span>
                </div>
                
                {/* Visual quick-action buttons */}
                <div className="flex items-center gap-2">
                  <Link 
                    to="/projects/board" 
                    className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-[#01FDF6] flex items-center justify-center transition-all border border-gray-850"
                    title="Open Kanban Board"
                  >
                    <FolderKanban size={14} />
                  </Link>
                  <Link 
                    to="/projects/timeline" 
                    className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-[#01FDF6] flex items-center justify-center transition-all border border-gray-850"
                    title="Open Timeline Gantt"
                  >
                    <Clock size={14} />
                  </Link>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Launch New Deliverable Project"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Title *</label>
            <input 
              type="text" 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#21FA90]" 
              placeholder="e.g. Quantum Core Cloud Migration" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linked Enterprise Company *</label>
            <input 
              type="text" 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#21FA90]" 
              placeholder="e.g. CloudScale Inc." 
              value={company} 
              onChange={e => setCompany(e.target.value)} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Allocated Budget ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#21FA90]" 
                placeholder="e.g. 50000" 
                value={budget} 
                onChange={e => setBudget(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Budget Spent ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#21FA90]" 
                placeholder="e.g. 10000" 
                value={spent} 
                onChange={e => setSpent(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Start Date</label>
              <input 
                type="date" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#21FA90]" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Due Date</label>
              <input 
                type="date" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#21FA90]" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Initial Health Status</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#21FA90]" 
                value={health} 
                onChange={e => setHealth(e.target.value)}
              >
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
                <option value="Off Track">Off Track</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Portfolio Representative</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#21FA90]" 
                value={owner} 
                onChange={e => setOwner(e.target.value)}
              >
                <option value="Curtis Miller">Curtis Miller</option>
                <option value="Sarah Jenkins">Sarah Jenkins</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description Overview</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#21FA90] h-20 resize-none" 
              placeholder="State the primary targets and scope parameters of this deliverable..." 
              value={description} 
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-lg text-sm bg-gray-950 border border-gray-850 text-gray-300 hover:text-white transition-all" 
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-lg text-sm bg-[#21FA90] hover:bg-[#1ee081] text-[#0a0f1e] font-bold shadow-glow transition-all"
            >
              Launch Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
