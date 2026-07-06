import { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { ROLE_TITLES } from '../lib/appRoutes';

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const { user } = useAuth();
  const role = user?.role || 'editor';

  const value = useMemo(() => {
    const isSuperAdmin = role === 'super_admin';
    const isAdmin = role === 'admin' || isSuperAdmin;

    return {
      role,
      roleInfo: {
        id: role,
        label: ROLE_TITLES[role] || role,
        title: ROLE_TITLES[role] || role,
      },
      isEditor: role === 'editor',
      isAdmin,
      isSuperAdmin,
      isPhotographer: role === 'photographer',
    };
  }, [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
