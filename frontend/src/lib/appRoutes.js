export function getDefaultAppRoute(role) {
  if (role === 'admin' || role === 'super_admin' || role === 'editor') {
    return '/app/dashboard';
  }
  return '/app/dashboard';
}

export const ROLE_TITLES = {
  editor: 'Editor',
  admin: 'Admin',
  super_admin: 'Super Admin',
};
