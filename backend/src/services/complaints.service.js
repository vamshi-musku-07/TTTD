const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { notifyComplaintSubmitted } = require('./notifications.service');

const ADMIN_ROLES = ['admin', 'super_admin'];
const SUBMITTER_ROLES = ['editor'];

const ROLE_LABELS = {
  admin: 'Admin',
  super_admin: 'Super Admin',
  editor: 'Editor',
};

function generateTicketId() {
  return `MF-${Math.floor(9000 + Math.random() * 999)}`;
}

function formatRelativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatComplaint(complaint) {
  const obj = complaint.toObject ? complaint.toObject() : complaint;
  const submitter = obj.submittedBy && typeof obj.submittedBy === 'object' ? obj.submittedBy : null;
  const assignee = obj.assignedTo && typeof obj.assignedTo === 'object' ? obj.assignedTo : null;

  const submitterName = submitter
    ? (() => {
        const first = String(submitter.firstName || '').trim();
        const last = String(submitter.lastName || '').trim();
        if (first && first === last) return first;
        return `${first} ${last}`.trim() || 'Unknown';
      })()
    : 'Unknown';
  const assigneeName = assignee
    ? (() => {
        const first = String(assignee.firstName || '').trim();
        const last = String(assignee.lastName || '').trim();
        if (first && first === last) return first;
        return `${first} ${last}`.trim() || 'Unknown';
      })()
    : 'Unknown';

  return {
    id: obj.ticketId,
    category: obj.category,
    subject: obj.subject,
    description: obj.description,
    submittedAt: formatRelativeTime(obj.createdAt),
    createdAt: obj.createdAt,
    submittedBy: submitterName,
    submittedByRole: ROLE_LABELS[obj.submitterRole] || obj.submitterRole,
    assignedTo: assigneeName,
    assignedToRole: assignee ? ROLE_LABELS[assignee.role] || assignee.role : '',
    assignedToId: assignee?._id?.toString() || obj.assignedTo?.toString(),
    status: obj.status,
    awaitingReview: obj.status === 'open',
    isSuggestion: obj.category === 'General Suggestion',
    adminReply: obj.adminReply?.message
      ? {
          author: obj.adminReply.author,
          date: obj.adminReply.repliedAt
            ? new Date(obj.adminReply.repliedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '',
          message: obj.adminReply.message,
        }
      : null,
  };
}

async function listRecipients() {
  const admins = await User.find({
    role: { $in: ADMIN_ROLES },
    isEmailVerified: true,
  })
    .select('firstName lastName email role')
    .sort({ role: -1, firstName: 1 });

  return admins.map((user) => {
    const first = String(user.firstName || '').trim();
    const last = String(user.lastName || '').trim();
    const name = first && first === last ? first : `${first} ${last}`.trim();
    return {
      id: user._id.toString(),
      name,
      email: user.email,
      role: user.role,
      label: ROLE_LABELS[user.role] || user.role,
    };
  });
}

function buildComplaintSubject(data) {
  if (data.category === 'Other') {
    return data.otherDetails.trim().slice(0, 200);
  }
  return data.category;
}

async function listComplaints(userId, activeRole) {
  let query;

  if (ADMIN_ROLES.includes(activeRole)) {
    if (activeRole === 'super_admin') {
      query = {};
    } else {
      query = { assignedTo: userId };
    }
  } else if (SUBMITTER_ROLES.includes(activeRole)) {
    query = { submittedBy: userId };
  } else {
    query = { submittedBy: userId };
  }

  const complaints = await Complaint.find(query)
    .populate('submittedBy', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName role')
    .sort({ createdAt: -1 });

  return complaints.map(formatComplaint);
}

async function createComplaint(data, userId) {
  if (!SUBMITTER_ROLES.includes(data.submitterRole)) {
    const err = new Error('Only editors and cameramen can submit complaints');
    err.status = 403;
    throw err;
  }

  const assignee = await User.findById(data.assignedToId);
  if (!assignee || !ADMIN_ROLES.includes(assignee.role)) {
    const err = new Error('Selected recipient is not a valid admin');
    err.status = 400;
    throw err;
  }

  let ticketId = generateTicketId();
  let attempts = 0;
  while (attempts < 5) {
    const exists = await Complaint.findOne({ ticketId });
    if (!exists) break;
    ticketId = generateTicketId();
    attempts += 1;
  }

  const complaint = await Complaint.create({
    ticketId,
    category: data.category,
    subject: buildComplaintSubject(data),
    description: data.description.trim(),
    submitterRole: data.submitterRole,
    submittedBy: userId,
    assignedTo: assignee._id,
  });

  await complaint.populate([
    { path: 'submittedBy', select: 'firstName lastName' },
    { path: 'assignedTo', select: 'firstName lastName role' },
  ]);

  try {
    await notifyComplaintSubmitted(complaint);
  } catch {
    // notifications should not block complaint submission
  }

  return formatComplaint(complaint);
}

async function resolveComplaint(complaintId, userId, activeRole, replyMessage) {
  if (!ADMIN_ROLES.includes(activeRole)) {
    const err = new Error('Only admins can resolve complaints');
    err.status = 403;
    throw err;
  }

  const complaint = await Complaint.findOne({ ticketId: complaintId });
  if (!complaint) {
    const err = new Error('Complaint not found');
    err.status = 404;
    throw err;
  }

  if (activeRole === 'admin' && complaint.assignedTo.toString() !== userId) {
    const err = new Error('This complaint was not assigned to you');
    err.status = 403;
    throw err;
  }

  if (complaint.status === 'resolved') {
    const err = new Error('Complaint is already resolved');
    err.status = 400;
    throw err;
  }

  const admin = await User.findById(userId);
  const adminFirst = String(admin?.firstName || '').trim();
  const adminLast = String(admin?.lastName || '').trim();
  const adminName =
    adminFirst && adminFirst === adminLast
      ? adminFirst
      : `${adminFirst} ${adminLast}`.trim();
  const authorLabel =
    activeRole === 'super_admin'
      ? `Super Admin (${adminName})`
      : `Admin (${adminName})`;

  complaint.status = 'resolved';
  complaint.resolvedAt = new Date();
  complaint.adminReply = {
    message:
      replyMessage?.trim() ||
      'This complaint has been reviewed and marked as resolved.',
    author: authorLabel,
    repliedAt: new Date(),
  };

  await complaint.save();
  await complaint.populate([
    { path: 'submittedBy', select: 'firstName lastName' },
    { path: 'assignedTo', select: 'firstName lastName role' },
  ]);

  return formatComplaint(complaint);
}

module.exports = {
  listRecipients,
  listComplaints,
  createComplaint,
  resolveComplaint,
};
