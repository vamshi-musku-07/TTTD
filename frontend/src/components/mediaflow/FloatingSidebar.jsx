import { NavLink, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useTheme } from '../../context/ThemeContext';

const EDITOR_NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/app/events', label: 'Events', icon: 'space_dashboard' },
  { to: '/app/complaints', label: 'Complaints', icon: 'report_problem' },
  { to: '/app/settings', label: 'Settings', icon: 'settings' },
];

const ADMIN_NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/app/events', label: 'Events', icon: 'calendar_month' },
  { to: '/app/team', label: 'Team', icon: 'group' },
  { to: '/app/complaints', label: 'Complaints', icon: 'report_problem' },
  { to: '/app/settings', label: 'Settings', icon: 'settings' },
];

function SidebarIcon({ name, active }) {
  return (
    <span
      className={`material-symbols-outlined mf-rail-icon shrink-0 ${active ? 'mf-rail-icon--active' : ''}`}
      style={active ? { fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24" } : undefined}
    >
      {name}
    </span>
  );
}

function RailLink({ to, label, icon, railCompact, onNavigate }) {
  return (
    <li className="mf-rail-item">
      <NavLink
        to={to}
        end={to === '/app/dashboard'}
        className={({ isActive }) => `mf-rail-link ${isActive ? 'mf-rail-link--active' : ''}`}
        aria-label={label}
        title={railCompact ? label : undefined}
        onClick={onNavigate}
      >
        {({ isActive }) => (
          <>
            {railCompact && isActive && (
              <>
                <span className="mf-rail-notch mf-rail-notch--top" aria-hidden="true" />
                <span className="mf-rail-notch mf-rail-notch--bottom" aria-hidden="true" />
              </>
            )}
            <span className="mf-rail-link__inner">
              <SidebarIcon name={icon} active={isActive} />
              {!railCompact && <span className="mf-rail-label">{label}</span>}
            </span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export function FloatingSidebar({ onLogout }) {
  const { isAdmin } = useRole();
  const { sidebarCollapsed, mobileNavOpen, toggleSidebar, closeMobileNav } = useTheme();

  const navItems = isAdmin ? ADMIN_NAV : EDITOR_NAV;
  const railCompact = sidebarCollapsed && !mobileNavOpen;
  const railExpanded = !railCompact;

  const handleNavClick = () => {
    if (mobileNavOpen) closeMobileNav();
  };

  return (
    <aside className="mf-sidebar-rail" aria-label="Main navigation">
      <div className="mf-rail-panel">
        <div className="mf-rail-logo-row">
          <div className="mf-rail-logo-wrap">
            <div className="mf-rail-logo" aria-label="MediaFlow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3L21 19H3L12 3Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
              </svg>
            </div>
            {railExpanded && <span className="mf-rail-brand">MediaFlow</span>}
          </div>
          <button
            type="button"
            className="mf-rail-collapse mf-rail-collapse--desktop"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined mf-rail-collapse-icon text-[20px]">
              chevron_left
            </span>
          </button>
          <button
            type="button"
            className="mf-rail-close mf-rail-close--mobile"
            onClick={closeMobileNav}
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <nav className="flex-1 w-full">
          <ul className="mf-rail-list">
            {navItems.map((item) => (
              <RailLink
                key={item.to}
                {...item}
                railCompact={railCompact}
                onNavigate={handleNavClick}
              />
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={`mf-rail-logout ${railExpanded ? 'mf-rail-logout--expanded' : 'mx-auto'}`}
          onClick={onLogout}
          aria-label="Logout"
          title={railCompact ? 'Logout' : undefined}
        >
          <span className="material-symbols-outlined mf-rail-icon">logout</span>
          {railExpanded && <span className="mf-rail-logout-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export function useRailBreadcrumb() {
  const { pathname } = useLocation();
  const detailMatch = pathname.match(/\/events\/([^/]+)$/);
  if (detailMatch) {
    return 'Event Detail';
  }
  const segment = pathname.split('/').pop() || 'events';
  const map = {
    dashboard: 'Dashboard',
    events: 'Events',
    complaints: 'Complaints',
    settings: 'Settings',
    team: 'Team',
  };
  return map[segment] || 'Portal';
}
