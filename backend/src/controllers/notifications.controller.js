const notificationsService = require('../services/notifications.service');

async function listNotifications(req, res, next) {
  try {
    const [notifications, unreadCount] = await Promise.all([
      notificationsService.listNotifications(req.userId),
      notificationsService.getUnreadCount(req.userId),
    ]);
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notification = await notificationsService.markAsRead(
      req.params.notificationId,
      req.userId
    );
    res.json({ success: true, notification });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await notificationsService.markAllAsRead(req.userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, markAsRead, markAllAsRead };
