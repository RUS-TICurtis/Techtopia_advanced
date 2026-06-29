import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  FolderKanban,
  ArrowLeft,
  User,
  SlidersHorizontal,
  Sparkles,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks, useContacts, useProjects } from '../../hooks/useCrmData';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '../../components/ui/Toast';
import microsoftIntegrationService from '../../services/microsoftIntegrationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import PageContainer from '../../components/layout/PageContainer';
import './Projects.css';

export default function ProjectBoard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');

  const { tasks: allTasks = [], isLoading: isLoadingTasks, createTask, updateTask, deleteTask } = useTasks();
  const { contacts = [], isLoading: isLoadingContacts } = useContacts();
  const { projects = [] } = useProjects();

  const currentProject = projectId ? projects.find(p => p.id?.toString() === projectId.toString()) : null;
  const projectTitle = currentProject ? (currentProject.title || currentProject.name) : 'All Projects';

  const tasks = projectId 
    ? allTasks.filter(t => t.project?.id?.toString() === projectId.toString() || t.projectId?.toString() === projectId.toString()) 
    : allTasks;

  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    if (projectId) {
      microsoftIntegrationService.getProjectWorkspace(projectId)
        .then(data => {
          if (data) setWorkspace(data);
        })
        .catch(err => console.error("Error fetching workspace", err));
    }
  }, [projectId]);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('To Do');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [description, setDescription] = useState('');

  // Drag and Drop States
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [activeDropStage, setActiveDropStage] = useState(null);

  const columns = ['To Do', 'In Progress', 'In Review', 'Done'];

  const columnColors = {
    'To Do': 'hsl(var(--primary))',
    'In Progress': '#06b6d4', // Cyan
    'In Review': '#d946ef', // Fuchsia
    'Done': '#10b981' // Emerald
  };

  // Convert Task status to local Kanban stages
  const getKanbanStage = (task) => {
    const s = task.status || 'Todo';
    if (s === 'Todo') return 'To Do';
    return s;
  };

  const getDbStatus = (stage) => {
    if (stage === 'To Do') return 'Todo';
    return stage;
  };

  // Drag and drop mechanics
  const handleDragStart = (taskId) => {
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setActiveDropStage(null);
  };

  const handleDragOver = (e, col) => {
    e.preventDefault();
    if (activeDropStage !== col) {
      setActiveDropStage(col);
    }
  };

  const handleDrop = async (e, targetCol) => {
    e.preventDefault();
    const taskId = draggingTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find(t => t.id?.toString() === taskId.toString());
    if (task) {
      try {
        await updateTask({
          id: task.id,
          data: {
            status: getDbStatus(targetCol)
          }
        });
        showToast('Task Updated', `Task moved to ${targetCol}`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Error', 'Failed to move task', 'error');
      }
    }
    handleDragEnd();
  };

  const moveTaskManual = async (task, direction) => {
    const currentCol = getKanbanStage(task);
    const currentIdx = columns.indexOf(currentCol);
    let nextIdx = currentIdx + direction;
    if (nextIdx >= 0 && nextIdx < columns.length) {
      const nextCol = columns[nextIdx];
      try {
        await updateTask({
          id: task.id,
          data: {
            status: getDbStatus(nextCol)
          }
        });
        showToast('Task Updated', `Task moved to ${nextCol}`, 'success');
      } catch (err) {
        console.error(err);
        showToast('Error', 'Failed to move task manually', 'error');
      }
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title) return;

    const contact = contacts.find(c => c.id?.toString() === selectedContactId.toString());
    
    try {
      await createTask({
        name: title,
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority,
        status: getDbStatus(status),
        contactId: selectedContactId ? parseInt(selectedContactId, 10) : null,
        contactName: contact ? contact.name : '',
        description: description || '',
        projectId: projectId ? parseInt(projectId, 10) : null
      });

      // Reset Form
      setTitle(''); setDueDate(''); setPriority('Medium');
      setStatus('To Do'); setSelectedContactId(''); setDescription('');
      setIsAddModalOpen(false);

      showToast('Task Cataloged', 'Sprint deliverable has been successfully added to board.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to create sprint task.', 'error');
    }
  };

  const openEditModal = (task, e) => {
    e.stopPropagation();
    setSelectedTask(task);
    setTitle(task.name || task.title || '');
    setDueDate(task.dueDate || task.date || '');
    setPriority(task.priority || 'Medium');
    setStatus(getKanbanStage(task));
    setSelectedContactId(task.contactId?.toString() || '');
    setDescription(task.description || '');
    setIsEditModalOpen(true);
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!selectedTask || !title) return;

    const contact = contacts.find(c => c.id?.toString() === selectedContactId.toString());
    try {
      await updateTask({
        id: selectedTask.id,
        data: {
          name: title,
          dueDate: dueDate,
          priority,
          status: getDbStatus(status),
          contactId: selectedContactId ? parseInt(selectedContactId, 10) : null,
          contactName: contact ? contact.name : '',
          description
        }
      });

      setIsEditModalOpen(false);
      setSelectedTask(null);
      showToast('Success', 'Task deliverable was updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to edit sprint task.', 'error');
    }
  };

  const handleDeleteTask = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        setIsEditModalOpen(false);
        setSelectedTask(null);
        showToast('Deleted', 'Task has been purged from sprint.', 'error');
      } catch (err) {
        console.error(err);
        showToast('Error', 'Failed to delete task.', 'error');
      }
    }
  };

  const getPriorityVariant = (p) => {
    switch (p) {
      case 'High': return 'destructive';
      case 'Medium': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <PageContainer className="pipeline-page project-board-page min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link to="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-primary">🚀</span> Task Kanban Board {currentProject ? `— ${projectTitle}` : ''}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track project deliverables, sprint schedules, and development items</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Sprint Task
        </Button>
      </div>

      {workspace && (
        <div className="mb-6 p-4 bg-muted/50 border border-primary/20 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary w-6 h-6" />
            <div>
              <h3 className="text-foreground font-semibold text-sm">Microsoft 365 Workspace Active</h3>
              <p className="text-xs text-muted-foreground">Collaboration tools are provisioned for this project.</p>
            </div>
          </div>
          <div className="flex gap-3">
            {workspace.microsoftTeamId && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://teams.microsoft.com/l/team/${workspace.microsoftTeamId}/conversations`} target="_blank" rel="noreferrer" className="gap-1.5 text-blue-500 hover:text-blue-600">
                  <Users className="w-4 h-4" /> Open MS Teams
                </a>
              </Button>
            )}
            {workspace.sharePointSiteId && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://tenant.sharepoint.com/sites/Project-${workspace.projectId}`} target="_blank" rel="noreferrer" className="gap-1.5 text-emerald-500 hover:text-emerald-600">
                  <FolderKanban className="w-4 h-4" /> Open SharePoint
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Board Column view */}
      <div className="kanban-board-wrapper flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map(col => {
            const colTasks = tasks.filter(t => getKanbanStage(t) === col);
            const isOver = activeDropStage === col;
            const stageColor = columnColors[col];

            return (
              <div 
                key={col}
                className={`w-[320px] flex flex-col rounded-xl transition-all duration-200 border-2 ${isOver ? 'border-primary/50 bg-primary/5' : 'border-transparent'}`}
                onDragOver={(e) => handleDragOver(e, col)}
                onDrop={(e) => handleDrop(e, col)}
                onDragLeave={() => setActiveDropStage(null)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stageColor }} />
                    <span className="font-semibold text-sm tracking-tight">{col}</span>
                    <span className="bg-muted text-muted-foreground text-[10px] font-mono px-2 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                </div>

                {/* Task Cards */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar p-1">
                  <AnimatePresence mode="popLayout">
                    {colTasks.map(task => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        key={task.id}
                        className="bg-card text-card-foreground p-3.5 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-colors group relative"
                        draggable="true"
                        onDragStart={() => handleDragStart(task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => openEditModal(task, e)}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-medium text-sm leading-tight text-foreground">{task.name || task.title}</h4>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                            <Button variant="ghost" size="icon" className="w-6 h-6 h-6 text-muted-foreground hover:text-primary" onClick={(e) => openEditModal(task, e)}>
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-6 h-6 h-6 text-muted-foreground hover:text-destructive" onClick={(e) => handleDeleteTask(task.id, e)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 mt-auto">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{task.dueDate || task.date}</span>
                            </div>
                            {task.contactName && (
                              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                <User className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px]">{task.contactName}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[10px] font-mono text-muted-foreground">#{task.id}</span>
                            <Badge variant={getPriorityVariant(task.priority)} className="text-[9px] px-1.5 py-0">
                              {task.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Drag tuner manual shortcuts */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-muted border border-border rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={e => e.stopPropagation()}>
                          <button 
                            className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
                            disabled={col === columns[0]}
                            onClick={() => moveTaskManual(task, -1)}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
                            disabled={col === columns[columns.length - 1]}
                            onClick={() => moveTaskManual(task, 1)}
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {colTasks.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 text-muted-foreground text-center gap-2 bg-muted/30 min-h-[150px] transition-colors"
                      style={{
                        borderColor: isOver ? 'var(--primary)' : undefined
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4 opacity-50" />
                      </div>
                      <span className="text-xs font-medium">Sprint Block Empty</span>
                      <span className="text-[10px] opacity-70">Drag items here</span>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Register Sprint Task Deliverable</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="flex flex-col gap-4 py-4">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Deliverable Title <span className="text-destructive">*</span></label>
              <Input 
                placeholder="e.g. Conduct compliance security review" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Linked Customer Dossier</label>
              <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                <SelectTrigger>
                  <SelectValue placeholder="Associate Lead Contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name} ({c.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Task Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low Priority</SelectItem>
                    <SelectItem value="Medium">Medium Priority</SelectItem>
                    <SelectItem value="High">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Sprint Board Column</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Technical Details</label>
              <textarea 
                className="w-full bg-background border border-input rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none" 
                placeholder="State the core tasks and steps to fulfill..." 
                value={description} 
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Commit Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if(!open) setSelectedTask(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modify Sprint Task Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTask} className="flex flex-col gap-4 py-4">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Deliverable Title <span className="text-destructive">*</span></label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Linked Customer Dossier</label>
              <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                <SelectTrigger>
                  <SelectValue placeholder="Associate Lead Contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name} ({c.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Task Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low Priority</SelectItem>
                    <SelectItem value="Medium">Medium Priority</SelectItem>
                    <SelectItem value="High">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Sprint Board Column</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Technical Details</label>
              <textarea 
                className="w-full bg-background border border-input rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-4 flex sm:justify-between items-center w-full">
              <Button 
                type="button" 
                variant="destructive" 
                className="mr-auto flex items-center gap-2"
                onClick={(e) => handleDeleteTask(selectedTask.id, e)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedTask(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Deliverable
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
