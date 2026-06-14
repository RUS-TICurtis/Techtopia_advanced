import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Building2, 
  User, 
  SlidersHorizontal,
  ChevronRight,
  FolderKanban,
  Flag,
  Sparkles
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useProjects } from '../../hooks/useCrmData';
import './Projects.css';

export default function ProjectTimeline() {
  const { projects: backendProjects = [], isLoading } = useProjects();

  const projects = useMemo(() => {
    return backendProjects.map(proj => {
      // Ensure milestones, dates, progress and health have visual fallbacks
      const start = proj.startDate || proj.createdAt?.slice(0, 10) || '2026-05-01';
      const end = proj.dueDate || proj.endDate || '2026-07-15';
      const ms = proj.milestones && proj.milestones.length > 0 ? proj.milestones : [
        { name: "Project kickoff", date: start }
      ];
      return {
        id: proj.id,
        title: proj.title || proj.name || 'Unnamed Project',
        company: proj.company || proj.clientName || 'General Client',
        progress: typeof proj.progress === 'number' ? proj.progress : 0,
        health: proj.health || 'On Track',
        startDate: start,
        dueDate: end,
        owner: proj.owner || proj.manager || 'Curtis Miller',
        milestones: ms
      };
    });
  }, [backendProjects]);

  const getHealthColor = (h) => {
    switch (h) {
      case 'On Track': return '#10B981'; // Green
      case 'At Risk': return '#F59E0B'; // Yellow
      case 'Off Track': return '#EF4444'; // Magenta
      case 'Completed': return '#3B82F6'; // Blue
      default: return '#64748B';
    }
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#38BDF8]"></div>
      </div>
    );
  }

  // Gantt Chart Column Months: April 2026 to Sept 2026
  const timelineMonths = [
    { name: 'Apr', start: '2026-04-01', end: '2026-04-30' },
    { name: 'May', start: '2026-05-01', end: '2026-05-31' },
    { name: 'Jun', start: '2026-06-01', end: '2026-06-30' },
    { name: 'Jul', start: '2026-07-01', end: '2026-07-31' },
    { name: 'Aug', start: '2026-08-01', end: '2026-08-31' },
    { name: 'Sep', start: '2026-09-01', end: '2026-09-30' }
  ];

  // Calculate grid position for project bars
  const calculateBarPosition = (startDate, dueDate) => {
    const start = new Date(startDate);
    const end = new Date(dueDate);
    const startRange = new Date('2026-04-01');
    const endRange = new Date('2026-09-30');

    // Total days in the 6 month timeline
    const totalDays = (endRange - startRange) / (1000 * 60 * 60 * 24);
    
    // Calculate start percentage
    const startOffset = Math.max(0, (start - startRange) / (1000 * 60 * 60 * 24));
    const startPct = (startOffset / totalDays) * 100;

    // Calculate width percentage
    const duration = (end - start) / (1000 * 60 * 60 * 24);
    const widthPct = Math.min(100 - startPct, (duration / totalDays) * 100);

    return { left: `${startPct}%`, width: `${widthPct}%` };
  };

  // Calculate visual position for a specific milestone
  const calculateMilestonePosition = (msDate, startDate, dueDate) => {
    const start = new Date(startDate);
    const end = new Date(dueDate);
    const ms = new Date(msDate);

    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const msOffset = (ms - start) / (1000 * 60 * 60 * 24);
    const msPct = Math.max(0, Math.min(100, (msOffset / totalDays) * 100));

    return `${msPct}%`;
  };

  return (
    <div className="page-container projects-page project-timeline-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Link to="/projects" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="text-[#38BDF8]">⚡</span> Portfolio Gantt Timeline
          </h1>
          <p className="page-subtitle">Visual sprint tracking, project windows, and milestone delivery targets</p>
        </div>
        <div className="flex gap-2">
          <Link to="/projects" className="btn btn-secondary text-xs px-3 py-2 border-gray-800 text-gray-400 hover:text-white">
            List View
          </Link>
          <Link to="/projects/board" className="btn btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 border-gray-800 text-gray-400 hover:text-white">
            <FolderKanban size={14} /> Kanban Board
          </Link>
        </div>
      </div>

      <div className="card premium-panel overflow-hidden p-6 bg-[#1E293B]/40 border border-gray-800/80 backdrop-blur-md">
        
        {/* Timeline Header (Months) */}
        <div className="timeline-gantt-wrapper relative mt-4">
          <div className="gantt-months-grid grid grid-cols-6 border-b border-gray-800 pb-3 text-xs text-gray-500 font-mono font-bold tracking-wider text-center">
            {timelineMonths.map(m => (
              <div key={m.name} className="border-r border-gray-850/40 last:border-r-0">
                {m.name.toUpperCase()} 2026
              </div>
            ))}
          </div>

          {/* Grid vertical gridlines */}
          <div className="absolute inset-0 top-8 grid grid-cols-6 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border-r border-gray-850/15 last:border-r-0 h-full"></div>
            ))}
          </div>

          {/* Project Timeline Rows */}
          <div className="gantt-rows flex flex-col gap-8 py-6 relative z-10">
            {projects.map(proj => {
              const pos = calculateBarPosition(proj.startDate, proj.dueDate);
              const color = getHealthColor(proj.health);
              
              return (
                <div key={proj.id} className="gantt-row flex flex-col gap-2 border-b border-gray-850/15 pb-6 last:border-0 last:pb-0">
                  
                  {/* Row Details Label */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-bold text-white text-sm">{proj.title}</span>
                      <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                        <Building2 size={10} /> {proj.company}
                      </span>
                    </div>
                    <span className="text-gray-400 font-mono text-[10px] font-bold">
                      {proj.startDate} <span className="text-gray-600">to</span> {proj.dueDate}
                    </span>
                  </div>

                  {/* Gantt Bar Lane */}
                  <div className="gantt-lane relative w-full h-8 bg-gray-950/40 border border-gray-850 rounded-lg">
                    
                    {/* Project Bar */}
                    <div 
                      className="absolute top-1 bottom-1 rounded-md flex items-center px-3 overflow-hidden select-none hover:shadow-glow transition-all"
                      style={{
                        left: pos.left,
                        width: pos.width,
                        background: `linear-gradient(90deg, ${color}33 0%, ${color}10 100%)`,
                        border: `1px solid ${color}50`
                      }}
                    >
                      {/* Bar Fill representing Progress */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 opacity-20 rounded-r-none rounded-md"
                        style={{
                          width: `${proj.progress}%`,
                          backgroundColor: color
                        }}
                      />
                      
                      <div className="relative z-10 flex items-center justify-between w-full text-[10px] font-black text-white font-mono uppercase tracking-wider">
                        <span className="truncate">{proj.progress}% Done</span>
                        <span>{proj.owner}</span>
                      </div>
                    </div>

                    {/* Milestones mapped on top of the bar */}
                    {proj.milestones && proj.milestones.map((ms, mIdx) => {
                      const msPos = calculateMilestonePosition(ms.date, proj.startDate, proj.dueDate);
                      // Calculate coordinate relative to the Gantt Bar's absolute position
                      // Since msPos is percentage of the bar, we can place a diamond element inside the bar!
                      return (
                        <div 
                          key={mIdx} 
                          className="absolute top-1/2 -translate-y-1/2 group"
                          style={{
                            left: `calc(${pos.left} + (${pos.width} * (${msPos} / 100)))`
                          }}
                        >
                          {/* Diamond Milestone marker */}
                          <div 
                            className="w-3.5 h-3.5 rotate-45 border-2 border-gray-950 flex items-center justify-center cursor-help transition-all duration-200 hover:scale-125"
                            style={{
                              backgroundColor: color,
                              boxShadow: `0 0 6px ${color}`
                            }}
                          />

                          {/* Hover tooltip showing milestone details */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1E293B] border border-gray-800 text-[10px] text-gray-300 font-bold px-2 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-55 flex flex-col gap-0.5 pointer-events-none">
                            <span className="text-white font-black flex items-center gap-1">
                              <Flag size={9} style={{ color }} /> {ms.name}
                            </span>
                            <span className="font-mono text-gray-500">Scheduled: {ms.date}</span>
                          </div>
                        </div>
                      );
                    })}

                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Info card describing timeline capabilities */}
      <div className="card p-4 bg-[#F59E0B]/5 border-l-4 border-l-[#F59E0B] flex gap-3 text-xs leading-relaxed text-gray-300">
        <Sparkles size={18} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Timeline Sprint Tracking activated.</span> Hover over the glowing diamond milestone tags inside the Gantt lanes to view detailed target scheduled cutover dates. Drag deliverables in the <Link to="/projects/board" className="text-[#38BDF8] font-bold underline hover:text-white transition-colors">Kanban Board</Link> to adjust completion velocities.
        </div>
      </div>
    </div>
  );
}
