const Notification = require('../models/Notification');
const User = require('../models/User');

const ADMIN_ROLES = ['admin', 'super_admin'];

function formatRelativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatNotification(notification) {
  const obj = notification.toObject ? notification.toObject() : notification;
  return {
    id: obj._id.toString(),
    type: obj.type,
    title: obj.title,
    message: obj.message,
    link: obj.link,
    relatedId: obj.relatedId,
    read: obj.read,
    time: formatRelativeTime(obj.createdAt),
    createdAt: obj.createdAt,
  };
}

async function notifyEventCreated(event, creatorUserId) {
  const creator = event.createdBy;
  const creatorName =
    creator && typeof creator === 'object'
      ? creator.fullName || `${creator.firstName} ${creator.lastName}`.trim()
      : 'Someone';

  const recipients = await User.find({ _id: { $ne: creatorUserId } }).select('_id');
  if (recipients.length === 0) return;

  const eventId = event._id?.toString() || event.id;
  const title = 'New event created';
  const message = `${creatorName} created "${event.title}"`;

  await Notification.insertMany(
    recipients.map((user) => ({
      user: user._id,
      type: 'event_created',
      title,
      message,
      link: `/app/events/${eventId}`,
      relatedId: eventId,
    }))
  );
}

async function notifyComplaintSubmitted(complaint) {
  const submitter = complaint.submittedBy;
  const submitterName =
    submitter && typeof submitter === 'object'
      ? `${submitter.firstName} ${submitter.lastName}`.trim()
      : 'A team member';

  const roleLabel = complaint.submitterRole === 'photographer' ? 'Cameraman' : 'Editor';
  const assignedId = complaint.assignedTo?._id?.toString() || complaint.assignedTo?.toString();

  const superAdmins = await User.find({ role: 'super_admin' }).select('_id');
  const recipientIds = new Set();
  if (assignedId) recipientIds.add(assignedId);
  superAdmins.forEach((admin) => recipientIds.add(admin._id.toString()));

  if (recipientIds.size === 0) return;

  const issueLabel = complaint.subject || complaint.category;
  const title = 'New complaint submitted';
  const message = `${submitterName} (${roleLabel}) submitted: ${issueLabel}`;

  await Notification.insertMany(
    [...recipientIds].map((userId) => ({
      user: userId,
      type: 'complaint_submitted',
      title,
      message,
      link: '/app/complaints',
      relatedId: complaint.ticketId,
    }))
  );
}

async function listNotifications(userId) {
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50);
  return notifications.map(formatNotification);
}

async function getUnreadCount(userId) {
  return Notification.countDocuments({ user: userId, read: false });
}

async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { read: true } },
    { new: true }
  );
  if (!notification) {
    const err = new Error('Notification not found');
    err.status = 404;
    throw err;
  }
  return formatNotification(notification);
}

async function markAllAsRead(userId) {
  await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
  return { success: true };
}

module.exports = {
  notifyEventCreated,
  notifyComplaintSubmitted,
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  ADMIN_ROLES,
};
