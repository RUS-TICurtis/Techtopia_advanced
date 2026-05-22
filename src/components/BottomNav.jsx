import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  UserCircle2, 
  GitBranch, 
  MoreHorizontal
} from 'lucide-react';
import './BottomNav.css';

export default function BottomNav({ currentTab, setCurrentTab }) {
  const [hidden, setHidden] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const lastScrollY = useRef(0);

  const tabs = [
    { id: 'dashboard', label: 'Home',     icon: LayoutDashboard },
    { id: 'leads',     label: 'Leads',    icon: TrendingUp },
    { id: 'clients',   label: 'Clients',  icon: UserCircle2 },
    { id: 'pipeline',  label: 'Pipeline', icon: GitBranch },
  ];

  const moreTabs = [
    { id: 'billing',      label: 'Billing' },
    { id: 'contracts',    label: 'Contracts' },
    { id: 'support',      label: 'Support' },
    { id: 'ai-assistant', label: 'AI Assistant' },
    { id: 'analytics',    label: 'Analytics' },
    { id: 'team',         label: 'Team' },
    { id: 'settings',     label: 'Settings' },
  ];

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current + 10) {
        setHidden(true);
        setShowMore(false);
      } else if (currentY < lastScrollY.current - 10) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isMoreActive = moreTabs.some(t => t.id === currentTab);

  return (
    <>
      {/* More menu backdrop */}
      {showMore && (
        <div 
          className="bottom-nav-backdrop"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More menu popup */}
      {showMore && (
        <div className="bottom-nav-more-menu">
          <div className="bottom-nav-more-title">More</div>
          {moreTabs.map(tab => (
            <button
              key={tab.id}
              className={`bottom-nav-more-item ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentTab(tab.id);
                setShowMore(false);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <nav className={`bottom-nav${hidden ? ' hidden' : ''}`}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`bottom-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setCurrentTab(tab.id)}
            >
              <Icon size={22} className="bottom-nav-icon" />
              <span className="bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}

        {/* More button */}
        <button
          className={`bottom-nav-item${isMoreActive ? ' active' : ''}`}
          onClick={() => setShowMore(prev => !prev)}
        >
          <MoreHorizontal size={22} className="bottom-nav-icon" />
          <span className="bottom-nav-label">More</span>
        </button>
      </nav>
    </>
  );
}
