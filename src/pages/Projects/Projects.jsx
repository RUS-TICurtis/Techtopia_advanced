import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Calendar, Building2, User, FolderKanban, Clock
} from 'lucide-react';
import { useProjects, useCompanies, useUsers } from '../../hooks/useCrmData';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { showToast } from '../../components/ui/Toast';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import './Projects.css';

export default function Projects() {
  const { projects = [], isLoading, createProject } = useProjects();
  const { companies = [] } = useCompanies();
  const { users = [] } = useUsers();
  const [activeHealthFilter, setActiveHealthFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const navigate = useNavigate();

  // Form states for creating project
  const [title, setTitle] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [budget, setBudget] = useState('');
  const [spent, setSpent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [health, setHealth] = useState('On Track');
  const [ownerId, setOwnerId] = useState('');
  const [description, setDescription] = useState('');
  const [enableMicrosoftWorkspace, setEnableMicrosoftWorkspace] = useState(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      await createProject({
        title,
        customerId: companyId || undefined,
        progress: 0,
        health,
        budget: parseFloat(budget) || 0,
        spent: parseFloat(spent) || 0,
        startDate: startDate || new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ownerId: ownerId || undefined,
        description,
        enableMicrosoftWorkspace
      });

      setIsAddModalOpen(false);

      // Reset fields
      setTitle(''); setCompanyId(''); setBudget(''); setSpent('');
      setStartDate(''); setDueDate(''); setHealth('On Track'); setDescription(''); setOwnerId('');
      setEnableMicrosoftWorkspace(false);

      showToast('Project Created', `Project "${title}" has been successfully added.`, 'success');
    } catch (err) {
      console.error('Create project error:', err);
      const errors = err?.response?.data?.errors;
      const errorMsg = errors
        ? Object.entries(errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join(' | ')
        : err?.response?.data?.title || 'Failed to create new project.';
      showToast('Creation Failed', errorMsg, 'error');
    }
  };

  const getHealthBadgeVariant = (h) => {
    switch (h) {
      case 'On Track': return 'success';
      case 'At Risk': return 'warning';
      case 'Off Track': return 'destructive';
      case 'Completed': return 'default';
      default: return 'outline';
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
        icon={<span className="text-primary text-xl">🚀</span>}
        actions={
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        }
      />

      {/* Health Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          {['All', 'On Track', 'At Risk', 'Off Track', 'Completed'].map(tab => (
            <Button
              key={tab}
              variant={activeHealthFilter === tab ? "default" : "outline"}
              onClick={() => setActiveHealthFilter(tab)}
              className="rounded-full text-xs font-bold"
              size="sm"
            >
              {tab}
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-background/20 text-[10px] font-mono">
                {tab === 'All' ? projects.length : projects.filter(p => p.health === tab).length}
              </span>
            </Button>
          ))}
        </div>
        
        {/* Navigation Buttons for Subtree */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/projects/board" className="gap-2">
              <FolderKanban className="w-4 h-4" /> Kanban Board
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/projects/timeline" className="gap-2">
              <Clock className="w-4 h-4" /> Timeline Chart
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center min-h-[250px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground py-16 bg-muted/20 border border-dashed border-border rounded-2xl">
            <FolderKanban className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <span className="font-semibold">No Projects Found</span>
            <span className="text-sm mt-1">Create a new project deliverable to populate this list.</span>
          </div>
        ) : (
          filteredProjects.map(proj => {
            const budgetPercent = proj.budget > 0 ? Math.min(100, Math.floor((proj.spent / proj.budget) * 100)) : 0;
            const projectTitle = proj.title || proj.name;
            return (
              <div key={proj.id} className="flex flex-col gap-4 p-5 border border-border bg-card text-card-foreground rounded-xl shadow-sm hover:shadow-md transition-shadow">
                
                {/* Header: Title and Health */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base tracking-tight truncate hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/projects/board?projectId=${proj.id}`)}>
                      {projectTitle}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 truncate">
                      <Building2 className="w-3.5 h-3.5" />
                      {proj.client}
                    </p>
                  </div>
                  <Badge variant={getHealthBadgeVariant(proj.health)}>
                    {proj.health}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {proj.description || "No project overview description recorded."}
                </p>

                {/* Progress Bar */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary font-mono">{proj.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg text-xs mt-2">
                  <div className="flex flex-col gap-1 border-r border-border pr-2">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Budget</span>
                    <span className="font-mono font-semibold">
                      ${(proj.spent || 0).toLocaleString()} <span className="text-muted-foreground font-normal">/ ${(proj.budget || 0).toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 pl-2">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Owner</span>
                    <span className="font-medium flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-primary" />
                      {proj.manager || 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Date & Timers Footer */}
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due: {proj.dueDate || proj.endDate || 'No due date'}</span>
                  </div>
                  
                  {/* Visual quick-action buttons */}
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                      <Link to={`/projects/board?projectId=${proj.id}`} title="Kanban Board">
                        <FolderKanban className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                      <Link to="/projects/timeline" title="Timeline Chart">
                        <Clock className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Add Project Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Launch New Deliverable Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 py-4">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Project Title <span className="text-destructive">*</span></label>
              <Input 
                placeholder="e.g. Quantum Core Cloud Migration" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Linked Client Company</label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Target Due Date</label>
                <Input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Initial Health Status</label>
                <Select value={health} onValueChange={setHealth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select health" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                    <SelectItem value="Off Track">Off Track</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Project Owner</label>
                <Select value={ownerId} onValueChange={setOwnerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Description Overview</label>
              <textarea 
                className="w-full bg-background border border-input rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none" 
                placeholder="State the primary targets and scope parameters of this deliverable..." 
                value={description} 
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 mt-2 p-4 bg-muted/50 border border-border rounded-lg">
              <Checkbox 
                id="enable-ms-workspace"
                checked={enableMicrosoftWorkspace}
                onCheckedChange={setEnableMicrosoftWorkspace}
              />
              <div className="flex flex-col gap-1 leading-none">
                <label htmlFor="enable-ms-workspace" className="text-sm font-medium cursor-pointer">
                  Enable Microsoft 365 Workspace
                </label>
                <span className="text-xs text-muted-foreground">Automatically provisions a Microsoft Teams channel and SharePoint document library.</span>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Launch Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
