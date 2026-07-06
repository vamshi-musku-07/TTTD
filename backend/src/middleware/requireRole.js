const ADMIN_ROLES = ['admin', 'super_admin'];

function requireAdmin(req, res, next) {
  if (!ADMIN_ROLES.includes(req.user?.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  return next();
}

function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super admin access required' });
  }
  return next();
}

module.exports = { requireAdmin, requireSuperAdmin, ADMIN_ROLES };
