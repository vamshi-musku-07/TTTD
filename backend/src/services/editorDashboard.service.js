const Video = require('../models/Video');
const User = require('../models/User');
const { buildUploadChart, startOfDay } = require('./uploadChart.service');
const { ADMIN_ROLES } = require('../middleware/requireRole');

function formatEditorOption(user) {
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const name =
    !firstName
      ? user.email
      : firstName === lastName
        ? firstName
        : `${firstName} ${lastName}`.trim();

  return {
    id: user._id.toString(),
    name,
    avatar: user.avatar || null,
  };
}

async function listEditors() {
  const editors = await User.find({ role: 'editor' }).sort({ firstName: 1, lastName: 1 });
  return editors.map(formatEditorOption);
}

function buildMetrics(videos) {
  const todayStart = startOfDay(new Date());
  const uploadsToday = videos.filter((v) => v.createdAt >= todayStart).length;
  const eventsCovered = new Set(videos.map((v) => v.event.toString())).size;

  return {
    totalVideosUploaded: videos.length,
    eventsCovered,
    uploadsToday,
  };
}

/**
 * @param {{ userId: string, role: string, editorId?: string }} options
 */
async function getEditorDashboard({ userId, role, editorId }) {
  const isAdmin = ADMIN_ROLES.includes(role);
  const allVideos = await Video.find().sort({ createdAt: -1 });

  if (!isAdmin) {
    const userVideos = allVideos.filter((v) => v.uploadedBy.toString() === userId);
    return {
      metrics: buildMetrics(userVideos),
      uploadChart: buildUploadChart(userVideos),
      selectedEditorId: userId,
      editors: null,
      viewMode: 'self',
    };
  }

  const editors = await listEditors();
  const requestedId = typeof editorId === 'string' ? editorId.trim() : '';

  // Empty / "all" → aggregate across all editors
  if (!requestedId || requestedId === 'all') {
    const editorIds = new Set(editors.map((e) => e.id));
    const editorVideos = allVideos.filter((v) => editorIds.has(v.uploadedBy.toString()));
    return {
      metrics: buildMetrics(editorVideos),
      uploadChart: buildUploadChart(editorVideos),
      selectedEditorId: 'all',
      editors,
      viewMode: 'all',
    };
  }

  const selected = editors.find((e) => e.id === requestedId);
  if (!selected) {
    const err = new Error('Editor not found');
    err.status = 404;
    throw err;
  }

  const userVideos = allVideos.filter((v) => v.uploadedBy.toString() === requestedId);
  return {
    metrics: buildMetrics(userVideos),
    uploadChart: buildUploadChart(userVideos),
    selectedEditorId: requestedId,
    editors,
    viewMode: 'editor',
    selectedEditor: selected,
  };
}

module.exports = { getEditorDashboard, listEditors };
