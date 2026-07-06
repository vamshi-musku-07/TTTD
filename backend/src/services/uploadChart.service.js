const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildUploadChart(videos) {
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const dayStart = startOfDay(new Date());
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayVideos = videos.filter(
      (v) => v.createdAt >= dayStart && v.createdAt < dayEnd
    );

    days.push({
      day: DAY_LABELS[dayStart.getDay()],
      instagram: dayVideos.filter((v) => v.platforms?.includes('Instagram')).length,
      facebook: dayVideos.filter((v) => v.platforms?.includes('Facebook')).length,
      threads: dayVideos.filter((v) => v.platforms?.includes('Threads')).length,
      youtubeLong: dayVideos.filter((v) => v.type === 'Longform').length,
      youtubeShorts: dayVideos.filter((v) => v.type === 'Shortform').length,
      total: dayVideos.length,
    });
  }

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

module.exports = { buildUploadChart, startOfDay };
