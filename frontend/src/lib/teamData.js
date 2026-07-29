export const TEAM_ROLES = [{ value: 'editor', label: 'Editor' }];

export const TEAM_ROLE_STYLES = {
  editor: 'bg-amber-100 text-amber-800 border-amber-200',
  admin: 'bg-primary/10 text-primary border-primary/20',
};

export function getRoleLabel(role) {
  if (role === 'admin') return 'Admin';
  if (role === 'super_admin') return 'Super Admin';
  return 'Editor';
}
