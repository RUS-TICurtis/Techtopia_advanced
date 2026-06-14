import { useState } from 'react';
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
import { useProjects } from '../../hooks/useCrmData';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { showToast } from '../../components/ui/Toast';
import './Projects.css';

import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

export default function Projects() {
  const { projects = [], isLoading, createProject } = useProjects();
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!title || !company) return;

    try {
      await createProject({
        title,
        company,
        progress: 0,
        health,
        budget: parseFloat(budget) || 0,
        spent: parseFloat(spent) || 0,
        startDate: startDate || new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        owner,
        description
      });

      setIsAddModalOpen(false);

      // Reset fields
      setTitle(''); setCompany(''); setBudget(''); setSpent('');
      setStartDate(''); setDueDate(''); setHealth('On Track'); setDescription('');

      showToast('Project Created', `Project "${title}" has been successfully added.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Creation Failed', 'Failed to create new project.', 'error');
    }
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
    <PageContainer className="projects-page">
      <PageHeader
        title="Project Portfolio"
        subtitle="Track project health, progress bars, budgets, and milestones"
        icon={<span className="text-[#10B981] text-xl">⚡</span>}
        actions={
          <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} /> New Project
          </button>
        }
      />

      {/* Health Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          {['All', 'On Track', 'At Risk', 'Off Track', 'Completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveHealthFilter(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                activeHealthFilter === tab 
                  ? 'bg-[#10B981] border-[#10B981] text-[#0F172A] shadow-glow font-black' 
                  : 'bg-[#1E293B]/40 border-gray-800 text-gray-400 hover:text-white'
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
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center min-h-[250px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#10B981]"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-16 bg-[#1E293B]/20 border border-dashed border-gray-800 rounded-2xl">
            <FolderKanban size={36} className="text-gray-600 mb-2 animate-pulse" />
            <span className="font-bold text-sm">No Projects Found</span>
            <span className="text-xs text-gray-600 mt-1">Create a new project deliverable to populate this list.</span>
          </div>
        ) : (
          filteredProjects.map(proj => {
            const budgetPercent = proj.budget > 0 ? Math.min(100, Math.floor((proj.spent / proj.budget) * 100)) : 0;
            const projectTitle = proj.title || proj.name;
            return (
              <div key={proj.id} className="project-portfolio-card card premium-card flex flex-col gap-4 p-5 border border-gray-800/80 bg-[#1E293B]/40 backdrop-blur-md">
                
                {/* Header: Title and Health */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-extrabold text-base tracking-tight truncate hover:text-[#38BDF8] transition-colors">
                      {projectTitle}
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
                    <span className="text-[#38BDF8] font-mono">{proj.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-900 border border-gray-850 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#6366F1] to-[#38BDF8] rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-[#0F172A]/80 border border-gray-850 rounded-xl text-xs text-gray-300">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">BUDGET CONVERSION</span>
                    <span className="font-mono text-white font-extrabold text-xs">
                      ${(proj.spent || 0).toLocaleString()} <span className="text-gray-500">/ ${(proj.budget || 0).toLocaleString()}</span>
                    </span>
                    <span className="text-[9px] text-gray-500 mt-0.5 font-bold">Spent {budgetPercent}% of allocation</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-l border-gray-850 pl-4">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">PORTFOLIO OWNER</span>
                    <span className="text-xs text-gray-300 font-semibold flex items-center gap-1.5 mt-0.5">
                      <User size={12} className="text-[#6366F1]" />
                      {proj.owner || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Milestones list tags */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">ACTIVE MILESTONES</span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.milestones && proj.milestones.length > 0 ? (
                      proj.milestones.map((ms, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-gray-900 border border-gray-850 text-[10px] text-gray-400 font-medium">
                          {typeof ms === 'object' ? ms.name : ms}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-600 italic">No milestones defined</span>
                    )}
                  </div>
                </div>

                {/* Date & Timers Footer */}
                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-850/50 pt-4 mt-auto">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-[#38BDF8]" />
                    <span>Due: {proj.dueDate || proj.endDate || 'No due date'}</span>
                  </div>
                  
                  {/* Visual quick-action buttons */}
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/projects/board?projectId=${proj.id}`} 
                      className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-[#38BDF8] flex items-center justify-center transition-all border border-gray-850"
                      title="Open Kanban Board"
                    >
                      <FolderKanban size={14} />
                    </Link>
                    <Link 
                      to="/projects/timeline" 
                      className="w-8 h-8 rounded-lg bg-gray-900 hover:bg-gray-850 text-gray-400 hover:text-[#38BDF8] flex items-center justify-center transition-all border border-gray-850"
                      title="Open Timeline Gantt"
                    >
                      <Clock size={14} />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })
        )}
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
              className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#10B981]" 
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
              className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#10B981]" 
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
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#10B981]" 
                placeholder="e.g. 50000" 
                value={budget} 
                onChange={e => setBudget(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Budget Spent ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#10B981]" 
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
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#10B981]" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Due Date</label>
              <input 
                type="date" 
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#10B981]" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Initial Health Status</label>
              <select 
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#10B981]" 
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
                className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#10B981]" 
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
              className="w-full bg-[#0F172A] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#10B981] h-20 resize-none" 
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
              className="px-5 py-2.5 rounded-lg text-sm bg-[#10B981] hover:bg-[#10B981] text-[#0F172A] font-bold shadow-glow transition-all"
            >
              Launch Project
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
