const eventsService = require('../services/events.service');

async function listEvents(_req, res, next) {
  try {
    const events = await eventsService.listEvents();
    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
}

async function getEvent(req, res, next) {
  try {
    const event = await eventsService.getEventById(req.params.eventId);
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const event = await eventsService.createEvent(req.validated, req.userId);
    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const event = await eventsService.updateEvent(req.params.eventId, req.validated);
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    await eventsService.deleteEvent(req.params.eventId);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
}

async function updateEventStatus(req, res, next) {
  try {
    const event = await eventsService.updateEventStatus(req.params.eventId, req.validated);
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
}

async function listVideos(req, res, next) {
  try {
    const videos = await eventsService.listVideosForEvent(req.params.eventId, req.userId);
    res.json({ success: true, videos });
  } catch (err) {
    next(err);
  }
}

async function createVideo(req, res, next) {
  try {
    const video = await eventsService.createVideo(req.params.eventId, req.validated, req.userId);
    res.status(201).json({ success: true, video });
  } catch (err) {
    next(err);
  }
}

async function updateVideo(req, res, next) {
  try {
    const video = await eventsService.updateVideo(req.params.videoId, req.validated, req.userId);
    res.json({ success: true, video });
  } catch (err) {
    next(err);
  }
}

async function deleteVideo(req, res, next) {
  try {
    await eventsService.deleteVideo(req.params.videoId, req.userId);
    res.json({ success: true, message: 'Video deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  listVideos,
  createVideo,
  updateVideo,
  deleteVideo,
};
