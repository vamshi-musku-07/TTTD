import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/mediaflow/ThemeToggle';
import { FloatingSidebar, useRailBreadcrumb } from '../components/mediaflow/FloatingSidebar';
import NotificationBell from '../components/mediaflow/NotificationBell';
import { NameAvatar } from '../components/NameAvatar';
import '../styles/mediaflow.css';

export default function MediaFlowLayout() {
  const { user, logout } = useAuth();
  const { roleInfo } = useRole();
  const { theme, mobileNavOpen, closeMobileNav, toggleSidebar, sidebarCollapsed } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumb = useRailBreadcrumb();

  const hideGreeting =
    location.pathname.endsWith('/dashboard') ||
    location.pathname.endsWith('/editor-progress') ||
    location.pathname.endsWith('/events') ||
    location.pathname.endsWith('/complaints') ||
    location.pathname.endsWith('/team') ||
    /\/events\/[^/]+$/.test(location.pathname);

  const displayName = (() => {
    const first = user?.firstName || '';
    const last = user?.lastName || '';
    if (first && first === last) return first;
    return user?.fullName?.trim() || `${first} ${last}`.trim();
  })();
  const firstName = user?.firstName || displayName.split(' ')[0] || 'there';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    closeMobileNav();
  }, [location.pathname, closeMobileNav]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  return (
    <div
      className={`mediaflow-app ${mobileNavOpen ? 'mobile-nav-open' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      data-theme={theme}
    >
      <FloatingSidebar onLogout={handleLogout} />

      <div className="mf-shell">
        <header className="mf-header-bar">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              className="mf-icon-btn mf-mobile-menu-btn"
              onClick={toggleSidebar}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="mf-search hidden sm:flex">
              <span className="material-symbols-outlined mf-search__icon">search</span>
              <input type="search" placeholder="Search..." aria-label="Search" />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <ThemeToggle />

            <NotificationBell />

            <div className="mf-user-chip hidden sm:flex">
              <div className="text-right hidden lg:block">
                <p className="mf-text-user-name">{displayName}</p>
                <p className="mf-text-meta mt-0.5">{roleInfo.title}</p>
              </div>
              <NameAvatar
                name={displayName}
                avatar={user?.avatar}
                className="mf-avatar-letter"
                title={displayName}
              />
            </div>
          </div>
        </header>

        <main className="mf-main-content">
          {!hideGreeting && (
            <div className="mf-page-greeting hidden md:block">
              <h1 className="mf-text-display">Hi {firstName}.</h1>
              <p className="mf-text-body mt-1">
                Welcome back — you&apos;re viewing{' '}
                <span className="font-medium text-on-surface">{breadcrumb}</span>.
              </p>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {mobileNavOpen && (
        <div className="mf-mobile-scrim" onClick={closeMobileNav} aria-hidden="true" />
      )}
    </div>
  );
}
