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
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { useProjects } from '../../hooks/useCrmData';
import PageContainer from '../../components/layout/PageContainer';
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
      case 'On Track': return '#10b981'; // Emerald
      case 'At Risk': return '#f59e0b'; // Amber
      case 'Off Track': return '#ef4444'; // Red
      case 'Completed': return '#3b82f6'; // Blue
      default: return '#64748b'; // Slate
    }
  };

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </PageContainer>
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
    <PageContainer className="projects-page project-timeline-page">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link to="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-primary">🚀</span> Portfolio Gantt Timeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Visual sprint tracking, project windows, and milestone delivery targets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/projects">
              List View
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/projects/board" className="gap-2">
              <FolderKanban className="w-4 h-4" /> Kanban Board
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm overflow-hidden">
        
        {/* Timeline Header (Months) */}
        <div className="timeline-gantt-wrapper relative mt-4">
          <div className="gantt-months-grid grid grid-cols-6 border-b border-border pb-3 text-xs text-muted-foreground font-mono font-semibold tracking-wider text-center">
            {timelineMonths.map(m => (
              <div key={m.name} className="border-r border-border last:border-r-0">
                {m.name.toUpperCase()} 2026
              </div>
            ))}
          </div>

          {/* Grid vertical gridlines */}
          <div className="absolute inset-0 top-8 grid grid-cols-6 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border-r border-border border-dashed opacity-50 last:border-r-0 h-full"></div>
            ))}
          </div>

          {/* Project Timeline Rows */}
          <div className="gantt-rows flex flex-col gap-8 py-6 relative z-10">
            {projects.map(proj => {
              const pos = calculateBarPosition(proj.startDate, proj.dueDate);
              const color = getHealthColor(proj.health);
              
              return (
                <div key={proj.id} className="flex flex-col gap-2 border-b border-border pb-6 last:border-0 last:pb-0">
                  
                  {/* Row Details Label */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-foreground text-sm">{proj.title}</span>
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {proj.company}
                      </span>
                    </div>
                    <span className="text-muted-foreground font-mono text-[10px] font-medium">
                      {proj.startDate} <span className="opacity-60 mx-1">to</span> {proj.dueDate}
                    </span>
                  </div>

                  {/* Gantt Bar Lane */}
                  <div className="relative w-full h-8 bg-muted border border-border rounded-lg overflow-hidden">
                    
                    {/* Project Bar */}
                    <div 
                      className="absolute top-1 bottom-1 rounded-md flex items-center px-3 select-none transition-all hover:opacity-90"
                      style={{
                        left: pos.left,
                        width: pos.width,
                        backgroundColor: `${color}33`,
                        border: `1px solid ${color}`
                      }}
                    >
                      {/* Bar Fill representing Progress */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 opacity-40 rounded-r-none rounded-md"
                        style={{
                          width: `${proj.progress}%`,
                          backgroundColor: color
                        }}
                      />
                      
                      <div className="relative z-10 flex items-center justify-between w-full text-[10px] font-bold text-foreground font-mono uppercase tracking-wider mix-blend-difference">
                        <span className="truncate mr-2">{proj.progress}% Done</span>
                        <span className="truncate">{proj.owner}</span>
                      </div>
                    </div>

                    {/* Milestones mapped on top of the bar */}
                    {proj.milestones && proj.milestones.map((ms, mIdx) => {
                      const msPos = calculateMilestonePosition(ms.date, proj.startDate, proj.dueDate);
                      return (
                        <div 
                          key={mIdx} 
                          className="absolute top-1/2 -translate-y-1/2 group z-20"
                          style={{
                            left: `calc(${pos.left} + (${pos.width} * (${msPos} / 100)))`
                          }}
                        >
                          {/* Diamond Milestone marker */}
                          <div 
                            className="w-3.5 h-3.5 rotate-45 border-2 border-background flex items-center justify-center cursor-help transition-transform hover:scale-125"
                            style={{ backgroundColor: color }}
                          />

                          {/* Hover tooltip showing milestone details */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border text-[10px] px-2.5 py-1.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex flex-col gap-0.5 pointer-events-none">
                            <span className="font-semibold flex items-center gap-1.5">
                              <Flag className="w-3 h-3" style={{ color }} /> {ms.name}
                            </span>
                            <span className="font-mono text-muted-foreground">Scheduled: {ms.date}</span>
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
      <div className="mt-6 p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-lg flex gap-3 text-sm text-foreground">
        <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-500">Timeline Sprint Tracking activated.</span> Hover over the diamond milestone tags inside the Gantt lanes to view detailed target scheduled cutover dates. Drag deliverables in the <Link to="/projects/board" className="text-primary font-medium hover:underline">Kanban Board</Link> to adjust completion velocities.
        </div>
      </div>
    </PageContainer>
  );
}
