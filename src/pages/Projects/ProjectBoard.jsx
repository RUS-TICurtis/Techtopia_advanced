import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FolderKanban,
  ArrowLeft,
  User,
  SlidersHorizontal,
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks, useContacts, useProjects } from '../../hooks/useCrmData';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { showToast } from '../../components/ui/Toast';
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
    ? allTasks.filter(t => t.project?.id?.toString() === projectId.toString()) 
    : allTasks;

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
    'To Do': 'var(--brand-purple)',
    'In Progress': 'var(--brand-cyan)',
    'In Review': 'var(--brand-magenta)',
    'Done': 'var(--brand-green)'
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
    setSelectedContactId(task.contactId || '');
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
      case 'High': return 'error';
      case 'Medium': return 'warning';
      default: return 'neutral';
    }
  };

  return (
    <div className="page-container pipeline-page project-board-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Link to="/projects" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="text-[#01FDF6]">⚡</span> Task Kanban Board {currentProject ? `— ${projectTitle}` : ''}
          </h1>
          <p className="page-subtitle">Track project deliverables, sprint schedules, and development items</p>
        </div>
        <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} /> New Sprint Task
        </button>
      </div>

      {/* Board Column view */}
      <div className="kanban-board-wrapper">
        <div className="kanban-board">
          {columns.map(col => {
            const colTasks = tasks.filter(t => getKanbanStage(t) === col);
            const isOver = activeDropStage === col;
            const stageColor = columnColors[col];

            return (
              <div 
                key={col}
                className={`kanban-column ${isOver ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, col)}
                onDrop={(e) => handleDrop(e, col)}
                onDragLeave={() => setActiveDropStage(null)}
                style={{
                  '--stage-color': stageColor,
                  borderColor: isOver ? stageColor : 'var(--border-light)'
                }}
              >
                {/* Column Header */}
                <div className="kanban-column-header" style={{ borderBottomColor: `${stageColor}33` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: stageColor, boxShadow: `0 0 10px ${stageColor}` }} />
                    <span className="kanban-column-title">{col}</span>
                    <span className="kanban-column-count">{colTasks.length}</span>
                  </div>
                </div>

                {/* Task Cards */}
                <div className="kanban-cards-wrapper custom-scrollbar mt-3">
                  <AnimatePresence mode="popLayout">
                    {colTasks.map(task => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        key={task.id}
                        className="kanban-card premium-card"
                        draggable="true"
                        onDragStart={() => handleDragStart(task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => openEditModal(task, e)}
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="kanban-card-title">{task.name || task.title}</h4>
                          <div className="kanban-card-actions">
                            <button 
                              onClick={(e) => openEditModal(task, e)} 
                              className="kanban-card-action-btn"
                            >
                              <SlidersHorizontal size={10} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteTask(task.id, e)} 
                              className="kanban-card-action-btn delete"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>

                        {task.description && (
                          <p className="kanban-card-notes">
                            {task.description}
                          </p>
                        )}

                        <div className="kanban-card-meta-row">
                          <div className="flex items-center gap-1 font-mono text-[10px]">
                            <Calendar size={11} />
                            <span>{task.dueDate || task.date}</span>
                          </div>
                          {task.contactName && (
                            <div className="kanban-card-probability" style={{ color: 'var(--brand-purple)' }}>
                              <User size={10} />
                              <span>{task.contactName}</span>
                            </div>
                          )}
                        </div>

                        <div className="kanban-card-footer">
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-light)' }}>#{task.id}</span>
                          <Badge variant={getPriorityVariant(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>

                        {/* Drag tuner manual shortcuts */}
                        <div className="kanban-card-movers" onClick={e => e.stopPropagation()}>
                          <button 
                            className="mover-btn"
                            disabled={col === columns[0]}
                            onClick={() => moveTaskManual(task, -1)}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="mover-label">TUNER</span>
                          <button 
                            className="mover-btn"
                            disabled={col === columns[columns.length - 1]}
                            onClick={() => moveTaskManual(task, 1)}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>

                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {colTasks.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="kanban-drop-zone flex flex-col items-center justify-center border-2 border-dashed border-gray-850 rounded-xl p-6 text-gray-500 text-center gap-2 bg-[#090f1e]/40 min-h-[150px] transition-colors"
                      style={{
                        borderColor: isOver ? stageColor : 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-900/60 border border-gray-850 flex items-center justify-center mb-1">
                        <Clock size={14} className="text-gray-600" />
                      </div>
                      <span className="text-xs font-semibold">Sprint Block Empty</span>
                      <span className="text-[10px] text-gray-600">Drag items here</span>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Sprint Task Deliverable"
        size="md"
      >
        <form onSubmit={handleAddTask} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deliverable Title *</label>
            <input 
              type="text" 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              placeholder="e.g. Conduct compliance security review" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linked Customer Dossier</label>
            <select 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={selectedContactId} 
              onChange={e => setSelectedContactId(e.target.value)}
            >
              <option value="">-- Associate Lead Contact --</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</label>
              <input 
                type="date" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Task Priority</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sprint Board Column</label>
            <select 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={status} 
              onChange={e => setStatus(e.target.value)}
            >
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Technical Details</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6] h-20 resize-none" 
              placeholder="State the core tasks and steps to fulfill..." 
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
              className="px-5 py-2.5 rounded-lg text-sm bg-[#01FDF6] hover:bg-[#00e5df] text-[#0a0f1e] font-bold shadow-glow transition-all"
            >
              Commit Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        title="Modify Sprint Task Details"
        size="md"
      >
        <form onSubmit={handleEditTask} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deliverable Title *</label>
            <input 
              type="text" 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Linked Customer Dossier</label>
            <select 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={selectedContactId} 
              onChange={e => setSelectedContactId(e.target.value)}
            >
              <option value="">-- Associate Lead Contact --</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.company})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</label>
              <input 
                type="date" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Task Priority</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
                value={priority} 
                onChange={e => setPriority(e.target.value)}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sprint Board Column</label>
            <select 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6]" 
              value={status} 
              onChange={e => setStatus(e.target.value)}
            >
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Technical Details</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#01FDF6] h-20 resize-none" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <button 
              type="button" 
              className="btn btn-secondary text-red-500 hover:text-red-400 border-red-950 bg-red-950/10 flex items-center gap-1.5"
              onClick={(e) => handleDeleteTask(selectedTask.id, e)}
            >
              <Trash2 size={14} /> Delete Deliverable
            </button>
            <div className="flex gap-3">
              <button 
                type="button" 
                className="px-5 py-2.5 rounded-lg text-sm bg-gray-950 border border-gray-850 text-gray-300 hover:text-white transition-all" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedTask(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 rounded-lg text-sm bg-[#01FDF6] hover:bg-[#00e5df] text-[#0a0f1e] font-bold shadow-glow transition-all"
              >
                Save Deliverable
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
