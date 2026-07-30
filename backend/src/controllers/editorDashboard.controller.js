const editorDashboardService = require('../services/editorDashboard.service');

async function getEditorDashboard(req, res, next) {
  try {
    const data = await editorDashboardService.getEditorDashboard({
      userId: req.userId,
      role: req.user?.role || 'editor',
      editorId: req.query.editorId,
      range: req.query.range,
      from: req.query.from,
      to: req.query.to,
    });
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEditorDashboard };
