import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useTheme } from '../../context/ThemeContext';
import { api, isSessionExpiredError } from '../../lib/api';
import { BRAND_ICON_SRC, BRAND_NAME } from '../../lib/brand';

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

function RailLink({ to, label, icon, railCompact, onNavigate, badgeCount = 0 }) {
  const showBadge = badgeCount > 0;
  const badgeText = badgeCount > 99 ? '99+' : String(badgeCount);

  return (
    <li className="mf-rail-item">
      <NavLink
        to={to}
        end={to === '/app/dashboard'}
        className={({ isActive }) => `mf-rail-link ${isActive ? 'mf-rail-link--active' : ''}`}
        aria-label={showBadge ? `${label}, ${badgeCount} open` : label}
        title={railCompact ? (showBadge ? `${label} (${badgeCount})` : label) : undefined}
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
              <span className="mf-rail-icon-wrap">
                <SidebarIcon name={icon} active={isActive} />
                {showBadge && (
                  <span className="mf-rail-badge" aria-hidden="true">
                    {badgeText}
                  </span>
                )}
              </span>
              {!railCompact && <span className="mf-rail-label">{label}</span>}
            </span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export function FloatingSidebar({ onLogout }) {
  const { accessToken, user } = useAuth();
  const { isAdmin } = useRole();
  const { sidebarCollapsed, mobileNavOpen, toggleSidebar, closeMobileNav } = useTheme();
  const { pathname } = useLocation();
  const [openComplaintsCount, setOpenComplaintsCount] = useState(0);

  const navItems = isAdmin ? ADMIN_NAV : EDITOR_NAV;
  const railCompact = sidebarCollapsed && !mobileNavOpen;
  const railExpanded = !railCompact;

  const loadOpenComplaintsCount = useCallback(async () => {
    if (!isAdmin || !accessToken || !user) {
      setOpenComplaintsCount(0);
      return;
    }
    const activeRole = user.role === 'super_admin' ? 'super_admin' : 'admin';
    try {
      const data = await api.getAdminDashboard(accessToken, activeRole);
      setOpenComplaintsCount(Number(data?.metrics?.openComplaints) || 0);
    } catch (err) {
      if (isSessionExpiredError(err)) return;
    }
  }, [accessToken, isAdmin, user]);

  useEffect(() => {
    loadOpenComplaintsCount();
  }, [loadOpenComplaintsCount, pathname]);

  const handleNavClick = () => {
    if (mobileNavOpen) closeMobileNav();
  };

  return (
    <aside className="mf-sidebar-rail" aria-label="Main navigation">
      <div className="mf-rail-panel">
        <div className="mf-rail-logo-row">
          <div className="mf-rail-logo-wrap">
            <div className="mf-rail-logo" aria-label={BRAND_NAME}>
              <img src={BRAND_ICON_SRC} alt="" className="h-[78%] w-[78%] object-contain" />
            </div>
            {railExpanded && <span className="mf-rail-brand">{BRAND_NAME}</span>}
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
                badgeCount={item.to === '/app/complaints' ? openComplaintsCount : 0}
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
