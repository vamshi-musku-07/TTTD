const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const editorDashboardController = require('../controllers/editorDashboard.controller');
const adminDashboardController = require('../controllers/adminDashboard.controller');

const router = Router();

router.get('/editor', authenticate, editorDashboardController.getEditorDashboard);
router.get('/admin', authenticate, adminDashboardController.getAdminDashboard);

module.exports = router;
