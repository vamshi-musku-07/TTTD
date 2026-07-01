import { NavLink, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { getEventById } from '../../lib/eventsData';

const EDITOR_NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/app/events', label: 'Events', icon: 'space_dashboard' },
  { to: '/app/complaints', label: 'Complaints', icon: 'report_problem' },
  { to: '/app/support', label: 'Support', icon: 'inventory_2' },
  { to: '/app/settings', label: 'Settings', icon: 'settings' },
];

const ADMIN_NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/app/events', label: 'Events', icon: 'calendar_month' },
  { to: '/app/footage', label: 'Footage', icon: 'movie' },
  { to: '/app/team', label: 'Team', icon: 'group' },
  { to: '/app/complaints', label: 'Complaints', icon: 'report_problem' },
];

const PHOTOGRAPHER_NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/app/events', label: 'Events', icon: 'calendar_month' },
  { to: '/app/footage', label: 'Gallery', icon: 'photo_library' },
  { to: '/app/settings', label: 'Settings', icon: 'settings' },
];

function SidebarIcon({ name, active }) {
  return (
    <span
      className={`material-symbols-outlined mf-rail-icon ${active ? 'mf-rail-icon--active' : ''}`}
      style={active ? { fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24" } : undefined}
    >
      {name}
    </span>
  );
}

function RailLink({ to, label, icon }) {
  return (
    <li className="mf-rail-item">
      <NavLink
        to={to}
        end={to === '/app/dashboard'}
        className={({ isActive }) => `mf-rail-link ${isActive ? 'mf-rail-link--active' : ''}`}
        aria-label={label}
        title={label}
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <>
                <span className="mf-rail-notch mf-rail-notch--top" aria-hidden="true" />
                <span className="mf-rail-notch mf-rail-notch--bottom" aria-hidden="true" />
              </>
            )}
            <span className="mf-rail-link__inner">
              <SidebarIcon name={icon} active={isActive} />
            </span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export function FloatingSidebar({ onLogout }) {
  const { isAdmin, isPhotographer } = useRole();

  const navItems = isAdmin ? ADMIN_NAV : isPhotographer ? PHOTOGRAPHER_NAV : EDITOR_NAV;

  return (
    <aside className="mf-sidebar-rail" aria-label="Main navigation">
      <div className="mf-rail-panel">
        <div className="mf-rail-logo" aria-label="MediaFlow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3L21 19H3L12 3Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          </svg>
        </div>

        <nav>
          <ul className="mf-rail-list">
            {navItems.map((item) => (
              <RailLink key={item.to} {...item} />
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="mf-rail-logout"
          onClick={onLogout}
          aria-label="Logout"
          title="Logout"
        >
          <span className="material-symbols-outlined mf-rail-icon">logout</span>
        </button>
      </div>
    </aside>
  );
}

export function useRailBreadcrumb() {
  const { pathname } = useLocation();
  const detailMatch = pathname.match(/\/events\/([^/]+)$/);
  if (detailMatch) {
    const event = getEventById(detailMatch[1]);
    return event ? event.title : 'Event Detail';
  }
  const segment = pathname.split('/').pop() || 'events';
  const map = {
    dashboard: 'Dashboard',
    events: 'Events',
    complaints: 'Complaints',
    support: 'Support',
    settings: 'Settings',
    footage: 'Footage',
    team: 'Team',
  };
  return map[segment] || 'Portal';
}
