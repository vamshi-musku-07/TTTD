const adminDashboardService = require('../services/adminDashboard.service');

function getActiveRole(req) {
  return req.headers['x-active-role'] || req.user?.role || 'editor';
}

async function getAdminDashboard(req, res, next) {
  try {
    const activeRole = getActiveRole(req);
    const data = await adminDashboardService.getAdminDashboard(req.userId, activeRole);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAdminDashboard };
