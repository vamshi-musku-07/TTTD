const editorDashboardService = require('../services/editorDashboard.service');

async function getEditorDashboard(req, res, next) {
  try {
    const data = await editorDashboardService.getEditorDashboard(req.userId);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEditorDashboard };
