import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/mediaflow/ThemeToggle';
import { FloatingSidebar, useRailBreadcrumb } from '../components/mediaflow/FloatingSidebar';
import '../styles/mediaflow.css';

export default function MediaFlowLayout() {
  const { user, logout } = useAuth();
  const { role, roles, selectRole, roleInfo, isAdmin } = useRole();
  const { theme, mobileNavOpen, closeMobileNav, toggleSidebar } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumb = useRailBreadcrumb();

  const hideGreeting =
    location.pathname.endsWith('/dashboard') ||
    location.pathname.endsWith('/events') ||
    location.pathname.endsWith('/complaints') ||
    /\/events\/[^/]+$/.test(location.pathname);

  const handleRoleChange = (newRole) => {
    selectRole(newRole);
    if (newRole === 'admin') navigate('/app/dashboard');
    else if (newRole === 'editor') navigate('/app/events');
    else if (newRole === 'photographer') navigate('/app/events');
    else navigate('/app/dashboard');
  };

  const displayName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const firstName = user?.firstName || displayName.split(' ')[0] || 'there';
  const avatar =
    user?.avatar ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBNIZkLq1dER2iJH_LzIURjIAXTkXzofeevwT9qlc_3LkcraCED04WcrsoFYW3DUkTSFxffyFnTZlmB3Y7h3qg3fbtHg-no5u0t5lf28rXZDip4-5nTyelxeQdNpqaut-gJpoYb-33TfmFhqGH4lHP7rmLKLqiiyjwFmZxmKQ0pPrpX6LrSyGy1lcwQoXo1eGEuT1tAPS7ilFFrqLVAOJtKeNRpToixZQ1aubNXew48Wk3jV-bouLpQdg-0hrwLap97tvP9vOIFHQ';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    closeMobileNav();
  }, [breadcrumb, closeMobileNav]);

  return (
    <div
      className={`mediaflow-app ${mobileNavOpen ? 'mobile-nav-open' : ''}`}
      data-theme={theme}
    >
      <FloatingSidebar onLogout={handleLogout} />

      <div className="mf-shell">
        <header className="mf-header-bar">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              className="mf-icon-btn lg:hidden"
              onClick={toggleSidebar}
              aria-label="Open menu"
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

            <div className="relative hidden md:block">
              <label htmlFor="role-select" className="sr-only">
                Select role
              </label>
              <select
                id="role-select"
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="mf-select"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined mf-select-chevron">expand_more</span>
            </div>

            <button type="button" className="mf-icon-btn" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <div className="mf-user-chip hidden sm:flex">
              <div className="text-right hidden lg:block">
                <p className="mf-text-user-name">{displayName}</p>
                <div className="flex items-center justify-end gap-2 mt-0.5">
                  {isAdmin && <span className="mf-admin-badge">Admin</span>}
                  <p className="mf-text-meta">{roleInfo.title}</p>
                </div>
              </div>
              <img alt="" className="mf-avatar" src={avatar} />
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
        <div className="mf-mobile-scrim lg:hidden" onClick={closeMobileNav} aria-hidden="true" />
      )}
    </div>
  );
}
