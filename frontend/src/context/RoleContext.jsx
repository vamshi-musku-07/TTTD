import { createContext, useContext, useMemo, useState } from 'react';

const ROLES = {
  editor: { id: 'editor', label: 'Editor', title: 'Senior Editor' },
  photographer: { id: 'photographer', label: 'Cameraman', title: 'Lead Cameraman' },
  admin: { id: 'admin', label: 'Admin', title: 'Administrator' },
};

const ROLE_KEY = 'tttd_active_role';

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    const stored = localStorage.getItem(ROLE_KEY);
    return ROLES[stored] ? stored : 'editor';
  });

  const selectRole = (roleId) => {
    if (!ROLES[roleId]) return;
    setRole(roleId);
    localStorage.setItem(ROLE_KEY, roleId);
  };

  const value = useMemo(
    () => ({
      role,
      roleInfo: ROLES[role],
      roles: Object.values(ROLES),
      selectRole,
      isEditor: role === 'editor',
      isAdmin: role === 'admin',
      isPhotographer: role === 'photographer',
    }),
    [role]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
