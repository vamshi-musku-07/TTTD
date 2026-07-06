const Video = require('../models/Video');
const { buildUploadChart, startOfDay } = require('./uploadChart.service');

async function getEditorDashboard(userId) {
  const allVideos = await Video.find().sort({ createdAt: -1 });
  const userVideos = allVideos.filter((v) => v.uploadedBy.toString() === userId);

  const todayStart = startOfDay(new Date());
  const uploadsToday = userVideos.filter((v) => v.createdAt >= todayStart).length;
  const eventsCovered = new Set(userVideos.map((v) => v.event.toString())).size;

  return {
    metrics: {
      totalVideosUploaded: userVideos.length,
      eventsCovered,
      uploadsToday,
    },
    uploadChart: buildUploadChart(allVideos),
  };
}

module.exports = { getEditorDashboard };
