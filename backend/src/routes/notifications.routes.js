const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const notificationsController = require('../controllers/notifications.controller');

const router = Router();

router.get('/', authenticate, notificationsController.listNotifications);
router.patch('/read-all', authenticate, notificationsController.markAllAsRead);
router.patch('/:notificationId/read', authenticate, notificationsController.markAsRead);

module.exports = router;
