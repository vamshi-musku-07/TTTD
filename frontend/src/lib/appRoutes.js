export function getDefaultAppRoute(role) {
  if (role === 'admin' || role === 'super_admin' || role === 'editor') {
    return '/app/dashboard';
  }
  return '/app/events';
}

export const ROLE_TITLES = {
  editor: 'Editor',
  photographer: 'Cameraman',
  admin: 'Admin',
  super_admin: 'Super Admin',
};
