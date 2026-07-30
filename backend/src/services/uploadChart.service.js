const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function parseDateInput(value) {
  if (!value || typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDayLabel(date) {
  return `${DAY_LABELS[date.getDay()]} ${date.getDate()}`;
}

function formatMonthDayLabel(date) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
}

function bucketVideos(videos, dayStart, dayEnd) {
  return videos.filter((v) => {
    const created = new Date(v.createdAt);
    return created >= dayStart && created < dayEnd;
  });
}

function summarizeDay(dayVideos, label) {
  return {
    day: label,
    instagram: dayVideos.filter((v) => v.platforms?.includes('Instagram')).length,
    facebook: dayVideos.filter((v) => v.platforms?.includes('Facebook')).length,
    threads: dayVideos.filter((v) => v.platforms?.includes('Threads')).length,
    youtubeLong: dayVideos.filter((v) => v.type === 'Longform').length,
    youtubeShorts: dayVideos.filter((v) => v.type === 'Shortform').length,
    total: dayVideos.length,
  };
}

function normalizeChart(days) {
  const maxStack = Math.max(
    ...days.map((d) => d.instagram + d.facebook + d.threads + d.youtubeLong + d.youtubeShorts),
    1
  );

  return days.map((d) => ({
    day: d.day,
    instagram: Math.round((d.instagram / maxStack) * 100),
    facebook: Math.round((d.facebook / maxStack) * 100),
    threads: Math.round((d.threads / maxStack) * 100),
    youtubeLong: Math.round((d.youtubeLong / maxStack) * 100),
    youtubeShorts: Math.round((d.youtubeShorts / maxStack) * 100),
    counts: {
      instagram: d.instagram,
      facebook: d.facebook,
      threads: d.threads,
      youtubeLong: d.youtubeLong,
      youtubeShorts: d.youtubeShorts,
      total: d.total,
    },
  }));
}

/** Default: last 7 calendar days (existing chart behavior). */
function buildUploadChart(videos) {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const dayStart = startOfDay(new Date());
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    days.push(summarizeDay(bucketVideos(videos, dayStart, dayEnd), DAY_LABELS[dayStart.getDay()]));
  }
  return normalizeChart(days);
}

/**
 * Build chart buckets for an explicit date window.
 * @param {Array} videos
 * @param {{ start: Date|null, end: Date|null, range: string }} window
 */
function buildUploadChartForRange(videos, window) {
  const range = window?.range || 'week';
  const now = new Date();

  if (range === 'day') {
    const dayStart = startOfDay(window.start || now);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return normalizeChart([
      summarizeDay(bucketVideos(videos, dayStart, dayEnd), formatDayLabel(dayStart)),
    ]);
  }

  if (range === 'lifetime') {
    // Show last 30 days of activity for a readable chart
    const days = [];
    for (let i = 29; i >= 0; i -= 1) {
      const dayStart = startOfDay(new Date());
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      days.push(
        summarizeDay(bucketVideos(videos, dayStart, dayEnd), formatMonthDayLabel(dayStart))
      );
    }
    return normalizeChart(days);
  }

  const start = startOfDay(window.start || now);
  const endExclusive = startOfDay(window.end || now);
  endExclusive.setDate(endExclusive.getDate() + 1);

  const days = [];
  const cursor = new Date(start);
  let guard = 0;
  while (cursor < endExclusive && guard < 366) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const label =
      range === 'week' ? DAY_LABELS[dayStart.getDay()] : formatMonthDayLabel(dayStart);
    days.push(summarizeDay(bucketVideos(videos, dayStart, dayEnd), label));
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }

  if (days.length === 0) {
    days.push(summarizeDay([], formatDayLabel(start)));
  }

  return normalizeChart(days);
}

module.exports = {
  buildUploadChart,
  buildUploadChartForRange,
  startOfDay,
  endOfDay,
  parseDateInput,
};
