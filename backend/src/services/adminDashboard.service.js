const Event = require('../models/Event');
const Video = require('../models/Video');
const Complaint = require('../models/Complaint');
const { buildUploadChart } = require('./uploadChart.service');

const ADMIN_ROLES = ['admin', 'super_admin'];

const ROLE_LABELS = {
  editor: 'Editor',
};

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

function formatComplaintPreview(complaint) {
  const obj = complaint.toObject ? complaint.toObject() : complaint;
  const submitter = obj.submittedBy && typeof obj.submittedBy === 'object' ? obj.submittedBy : null;
  const submitterName = submitter
    ? (() => {
        const first = String(submitter.firstName || '').trim();
        const last = String(submitter.lastName || '').trim();
        if (first && first === last) return first;
        return `${first} ${last}`.trim() || 'Unknown';
      })()
    : 'Unknown';

  return {
    id: obj.ticketId,
    name: submitterName,
    role: ROLE_LABELS[obj.submitterRole] || obj.submitterRole,
    time: formatRelativeTime(obj.createdAt),
    category: obj.category,
    subject: obj.subject,
    body: obj.description,
    avatar: submitter?.avatar || null,
  };
}

function buildOpenComplaintsQuery(userId, activeRole) {
  const query = { status: 'open' };
  if (activeRole === 'admin') {
    query.assignedTo = userId;
  }
  return query;
}

async function getAdminDashboard(userId, activeRole) {
  const events = await Event.find();
  const totalEvents = events.length;
  const activeEvents = events.filter((event) => event.editorStatus !== 'event-done').length;

  const complaintQuery = buildOpenComplaintsQuery(userId, activeRole);
  const [openComplaintsCount, openComplaintsPreview, allVideos] = await Promise.all([
    Complaint.countDocuments(complaintQuery),
    Complaint.find(complaintQuery)
      .populate('submittedBy', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(5),
    Video.find().sort({ createdAt: -1 }),
  ]);

  return {
    metrics: {
      totalEvents,
      activeEvents,
      totalVideosUploaded: allVideos.length,
      openComplaints: openComplaintsCount,
    },
    uploadChart: buildUploadChart(allVideos),
    openComplaints: openComplaintsPreview.map(formatComplaintPreview),
  };
}

module.exports = { getAdminDashboard, ADMIN_ROLES };
