import { useState, useEffect, useRef } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  UserCircle2, 
  GitBranch, 
  MoreHorizontal
} from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
  const [hidden, setHidden] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', icon: TrendingUp },
    { to: '/clients', label: 'Clients', icon: UserCircle2 },
    { to: '/pipeline', label: 'Pipeline', icon: GitBranch },
  ];

  const moreTabs = [
    { to: '/billing', label: 'Billing' },
    { to: '/contracts', label: 'Contracts' },
    { to: '/support', label: 'Support' },
    { to: '/ai', label: 'AI Assistant' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/team', label: 'Team' },
    { to: '/settings', label: 'Settings' },
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

  const isMoreActive = moreTabs.some(t => t.to === currentPath);

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
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => `bottom-nav-more-item ${isActive ? 'active' : ''}`}
              onClick={() => setShowMore(false)}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      )}

      <nav className={`bottom-nav${hidden ? ' hidden' : ''}`}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={22} className="bottom-nav-icon" />
              <span className="bottom-nav-label">{tab.label}</span>
            </NavLink>
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
