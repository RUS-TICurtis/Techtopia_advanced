import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { 
  Search, ShieldAlert, Sparkles, UserPlus, GitBranch, 
  Settings, FolderKanban, FileSpreadsheet, LayoutDashboard,
  Moon, Sun, HelpCircle, LogOut
} from 'lucide-react';
import './CommandPalette.css';

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Handle Ctrl+K / Cmd+K toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleCommand = (action) => {
    action();
    setCommandPaletteOpen(false);
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={() => setCommandPaletteOpen(false)}>
      <div className="command-palette-modal" onClick={e => e.stopPropagation()}>
        <Command label="Global Command Palette">
          <div className="command-input-wrapper">
            <Search className="command-search-icon" size={18} />
            <Command.Input 
              autoFocus 
              placeholder="Search contacts, actions, pages or dashboards..." 
              className="command-input"
            />
          </div>

          <Command.List className="command-list custom-scrollbar">
            <Command.Empty className="command-empty">No results found.</Command.Empty>

            {/* Dashboards & Navigation */}
            <Command.Group heading="Navigation">
              <Command.Item onSelect={() => handleCommand(() => navigate('/'))}>
                <LayoutDashboard size={16} />
                <span>Go to Dashboard</span>
                <kbd>G D</kbd>
              </Command.Item>
              <Command.Item onSelect={() => handleCommand(() => navigate('/pipeline'))}>
                <GitBranch size={16} />
                <span>View Deals Pipeline</span>
                <kbd>G P</kbd>
              </Command.Item>
              <Command.Item onSelect={() => handleCommand(() => navigate('/projects'))}>
                <FolderKanban size={16} />
                <span>Go to Projects</span>
                <kbd>G J</kbd>
              </Command.Item>
              <Command.Item onSelect={() => handleCommand(() => navigate('/reports'))}>
                <FileSpreadsheet size={16} />
                <span>View Intelligence Reports</span>
                <kbd>G R</kbd>
              </Command.Item>
              <Command.Item onSelect={() => handleCommand(() => navigate('/settings'))}>
                <Settings size={16} />
                <span>Open settings</span>
                <kbd>G S</kbd>
              </Command.Item>
            </Command.Group>

            {/* Quick Actions */}
            <Command.Group heading="Actions">
              <Command.Item onSelect={() => handleCommand(() => navigate('/ai'))}>
                <Sparkles size={16} className="text-[#00e5ff]" />
                <span className="text-[#00e5ff] font-medium">Ask AI Assistant</span>
                <kbd>A</kbd>
              </Command.Item>
              <Command.Item onSelect={() => handleCommand(() => navigate('/automations'))}>
                <Sparkles size={16} />
                <span>Configure Workflow Automations</span>
              </Command.Item>
              <Command.Item onSelect={() => handleCommand(() => navigate('/audit-logs'))}>
                <ShieldAlert size={16} className="text-[#ff0055]" />
                <span className="text-gray-300">View Security Audit Trail</span>
              </Command.Item>
              <Command.Item onSelect={() => handleCommand(() => navigate('/team'))}>
                <UserPlus size={16} />
                <span>Invite Team Member</span>
              </Command.Item>
            </Command.Group>

            {/* Settings & Theme */}
            <Command.Group heading="Preferences">
              <Command.Item onSelect={() => handleCommand(() => {
                const currentTheme = localStorage.getItem('crm-theme') || 'light';
                const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', nextTheme);
                localStorage.setItem('crm-theme', nextTheme);
                // force refresh to re-evaluate colors
                window.location.reload();
              })}>
                <Moon size={16} />
                <span>Toggle Dark / Light Theme</span>
                <kbd>T</kbd>
              </Command.Item>
              <Command.Item onSelect={() => handleCommand(() => navigate('/support'))}>
                <HelpCircle size={16} />
                <span>Help & Support Center</span>
              </Command.Item>
              <Command.Item onSelect={() => handleCommand(() => logout())} className="danger-item">
                <LogOut size={16} />
                <span>Sign Out / Lock Session</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
