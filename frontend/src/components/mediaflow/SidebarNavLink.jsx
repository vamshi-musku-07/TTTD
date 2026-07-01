import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

function Icon({ name, filled }) {
  return (
    <span className={`material-symbols-outlined shrink-0 ${filled ? 'filled' : ''}`}>{name}</span>
  );
}

export function SidebarNavLink({ to, label, icon, filledWhenActive }) {
  const { sidebarCollapsed } = useTheme();

  return (
    <div className="mf-tooltip-wrap" data-tooltip={sidebarCollapsed ? label : undefined}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `mf-nav-link flex items-center gap-3 px-4 py-3 transition-all duration-200 cursor-pointer active:scale-[0.98] border-l-4 ${
            isActive
              ? 'mf-nav-link--active bg-secondary-container/10 border-primary text-primary font-semibold'
              : 'text-on-surface-variant hover:bg-surface-container-low border-transparent'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon name={icon} filled={isActive && filledWhenActive} />
            <span className="mf-nav-label text-title-md font-semibold leading-7">{label}</span>
          </>
        )}
      </NavLink>
    </div>
  );
}

export function SidebarFooterLink({ to, label, icon }) {
  const { sidebarCollapsed } = useTheme();

  return (
    <div className="mf-tooltip-wrap" data-tooltip={sidebarCollapsed ? label : undefined}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `mf-nav-link flex items-center gap-3 px-4 py-3 transition-all duration-200 text-body-sm ${
            isActive
              ? 'text-primary font-medium bg-surface-container-low'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`
        }
      >
        <Icon name={icon} />
        <span className="mf-nav-label">{label}</span>
      </NavLink>
    </div>
  );
}
