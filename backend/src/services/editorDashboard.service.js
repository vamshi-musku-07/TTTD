const Video = require('../models/Video');
const User = require('../models/User');
const {
  buildUploadChart,
  buildUploadChartForRange,
  startOfDay,
  endOfDay,
  parseDateInput,
} = require('./uploadChart.service');
const { ADMIN_ROLES } = require('../middleware/requireRole');

const VALID_RANGES = new Set(['day', 'week', 'month', 'custom', 'lifetime']);

function formatEditorOption(user) {
  const firstName = String(user.firstName || '').trim();
  const lastName = String(user.lastName || '').trim();
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

function toDateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildMetrics(videos, rangeWindow) {
  const todayStart = startOfDay(new Date());
  const uploadsToday = videos.filter((v) => new Date(v.createdAt) >= todayStart).length;
  const eventsCovered = new Set(videos.map((v) => v.event.toString())).size;
  const activeDays = new Set(videos.map((v) => toDateKey(v.createdAt))).size;

  return {
    totalVideosUploaded: videos.length,
    eventsCovered,
    uploadsToday,
    activeDays,
    range: rangeWindow.range,
    rangeLabel: rangeWindow.label,
    from: rangeWindow.from,
    to: rangeWindow.to,
  };
}

/**
 * Resolve a date window for filtering.
 * @returns {{ range: string, start: Date|null, end: Date|null, from: string|null, to: string|null, label: string }}
 */
function resolveDateRange(rangeInput, fromInput, toInput) {
  const range = VALID_RANGES.has(rangeInput) ? rangeInput : 'lifetime';
  const now = new Date();

  if (range === 'lifetime') {
    return {
      range,
      start: null,
      end: null,
      from: null,
      to: null,
      label: 'Lifetime',
    };
  }

  if (range === 'day') {
    const start = startOfDay(now);
    const end = endOfDay(now);
    return {
      range,
      start,
      end,
      from: formatIsoDate(start),
      to: formatIsoDate(end),
      label: 'Today',
    };
  }

  if (range === 'week') {
    const end = endOfDay(now);
    const start = startOfDay(now);
    start.setDate(start.getDate() - 6);
    return {
      range,
      start,
      end,
      from: formatIsoDate(start),
      to: formatIsoDate(end),
      label: 'Last 7 days',
    };
  }

  if (range === 'month') {
    const end = endOfDay(now);
    const start = startOfDay(now);
    start.setDate(start.getDate() - 29);
    return {
      range,
      start,
      end,
      from: formatIsoDate(start),
      to: formatIsoDate(end),
      label: 'Last 30 days',
    };
  }

  // custom
  let start = parseDateInput(fromInput);
  let end = parseDateInput(toInput);

  if (!start && !end) {
    // default custom window = last 7 days if dates missing
    end = endOfDay(now);
    start = startOfDay(now);
    start.setDate(start.getDate() - 6);
  } else if (start && !end) {
    end = endOfDay(start);
    start = startOfDay(start);
  } else if (!start && end) {
    start = startOfDay(end);
    end = endOfDay(end);
  } else {
    start = startOfDay(start);
    end = endOfDay(end);
  }

  if (start > end) {
    const tmp = start;
    start = startOfDay(end);
    end = endOfDay(tmp);
  }

  // Cap custom range at 366 days
  const maxSpanMs = 366 * 24 * 60 * 60 * 1000;
  if (end.getTime() - start.getTime() > maxSpanMs) {
    start = startOfDay(new Date(end.getTime() - maxSpanMs));
  }

  return {
    range: 'custom',
    start,
    end,
    from: formatIsoDate(start),
    to: formatIsoDate(end),
    label: `${formatIsoDate(start)} → ${formatIsoDate(end)}`,
  };
}

function formatIsoDate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function filterVideosByRange(videos, rangeWindow) {
  if (!rangeWindow.start || !rangeWindow.end) return videos;
  return videos.filter((v) => {
    const created = new Date(v.createdAt);
    return created >= rangeWindow.start && created <= rangeWindow.end;
  });
}

/**
 * @param {{ userId: string, role: string, editorId?: string, range?: string, from?: string, to?: string }} options
 */
async function getEditorDashboard({ userId, role, editorId, range, from, to }) {
  const isAdmin = ADMIN_ROLES.includes(role);
  const allVideos = await Video.find().sort({ createdAt: -1 });
  const rangeWindow = isAdmin
    ? resolveDateRange(range, from, to)
    : resolveDateRange('lifetime');

  if (!isAdmin) {
    const userVideos = allVideos.filter((v) => v.uploadedBy.toString() === userId);
    return {
      metrics: buildMetrics(userVideos, rangeWindow),
      uploadChart: buildUploadChart(userVideos),
      selectedEditorId: userId,
      editors: null,
      viewMode: 'self',
      dateRange: rangeWindow,
    };
  }

  const editors = await listEditors();
  const requestedId = typeof editorId === 'string' ? editorId.trim() : '';

  let scopedVideos;
  let viewMode;
  let selectedEditor = null;
  let selectedEditorId = 'all';

  if (!requestedId || requestedId === 'all') {
    const editorIds = new Set(editors.map((e) => e.id));
    scopedVideos = allVideos.filter((v) => editorIds.has(v.uploadedBy.toString()));
    viewMode = 'all';
    selectedEditorId = 'all';
  } else {
    const selected = editors.find((e) => e.id === requestedId);
    if (!selected) {
      const err = new Error('Editor not found');
      err.status = 404;
      throw err;
    }
    scopedVideos = allVideos.filter((v) => v.uploadedBy.toString() === requestedId);
    viewMode = 'editor';
    selectedEditor = selected;
    selectedEditorId = requestedId;
  }

  const rangedVideos = filterVideosByRange(scopedVideos, rangeWindow);
  const uploadChart =
    rangeWindow.range === 'lifetime'
      ? buildUploadChartForRange(rangedVideos, rangeWindow)
      : buildUploadChartForRange(rangedVideos, rangeWindow);

  return {
    metrics: buildMetrics(rangedVideos, rangeWindow),
    uploadChart,
    selectedEditorId,
    editors,
    viewMode,
    selectedEditor,
    dateRange: rangeWindow,
  };
}

module.exports = { getEditorDashboard, listEditors, resolveDateRange };
