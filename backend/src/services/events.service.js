const Event = require('../models/Event');
const Video = require('../models/Video');
const { notifyEventCreated } = require('./notifications.service');

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=800&auto=format&fit=crop';

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDisplayDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatEvent(event) {
  const obj = event.toObject ? event.toObject() : event;
  const createdBy = obj.createdBy && typeof obj.createdBy === 'object'
    ? {
        id: obj.createdBy._id?.toString(),
        fullName: obj.createdBy.fullName || `${obj.createdBy.firstName} ${obj.createdBy.lastName}`.trim(),
      }
    : null;

  return {
    id: obj._id.toString(),
    slug: obj.slug,
    title: obj.title,
    subtitle: obj.subtitle || obj.type,
    image: obj.image || DEFAULT_IMAGE,
    date: formatDisplayDate(obj.scheduleDate),
    scheduleDate: obj.scheduleDate,
    time: obj.time || 'TBD',
    location: obj.location,
    type: obj.type,
    cameraman: obj.cameraman || 'Unassigned',
    live: obj.live ?? false,
    badge: obj.badge || (obj.highlightAsNew ? 'New Event' : 'Active Event'),
    editorStatus: obj.editorStatus,
    cameramanStatus: obj.cameramanStatus,
    isNew: obj.highlightAsNew ?? false,
    createdAt: obj.createdAt,
    createdBy,
  };
}

function formatVideo(video, currentUserId) {
  const obj = video.toObject ? video.toObject() : video;
  const uploader = obj.uploadedBy && typeof obj.uploadedBy === 'object'
    ? obj.uploadedBy
    : null;
  const uploaderId = uploader?._id?.toString() || obj.uploadedBy?.toString();
  const uploaderName = uploader
    ? uploader.fullName || `${uploader.firstName} ${uploader.lastName}`.trim()
    : 'Unknown';

  return {
    id: obj._id.toString(),
    title: obj.title,
    slug: obj.slug,
    type: obj.type,
    videoUrl: obj.videoUrl || '',
    description: obj.description || '',
    platforms: obj.platforms || [],
    thumbnail: obj.thumbnail || DEFAULT_IMAGE,
    editor: uploaderName,
    uploadedBy: uploaderId,
    uploadedByName: uploaderName,
    uploadedByAvatar: uploader?.avatar || null,
    canEdit: currentUserId ? uploaderId === currentUserId : false,
    createdAt: obj.createdAt,
  };
}

async function ensureUniqueSlug(baseSlug, excludeId) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Event.findOne(query);
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function findDuplicateTitle(title, excludeId) {
  const normalized = title.trim().toLowerCase();
  const events = await Event.find(excludeId ? { _id: { $ne: excludeId } } : {});
  return events.find((e) => e.title.trim().toLowerCase() === normalized) || null;
}

function getNewestHighlightedId(events) {
  const highlighted = events.filter((event) => event.highlightAsNew);
  if (highlighted.length === 0) return null;

  const newest = highlighted.reduce((latest, event) =>
    !latest || event.createdAt > latest.createdAt ? event : latest
  );
  return newest._id.toString();
}

async function listEvents() {
  const events = await Event.find()
    .populate('createdBy', 'firstName lastName fullName')
    .sort({ createdAt: -1 });

  const newestHighlightedId = getNewestHighlightedId(events);

  return events.map((event) => {
    const formatted = formatEvent(event);
    formatted.isNew = newestHighlightedId !== null && event._id.toString() === newestHighlightedId;
    return formatted;
  });
}

async function getEventById(eventId) {
  const event = await Event.findById(eventId).populate('createdBy', 'firstName lastName fullName');
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  if (event.highlightAsNew) {
    event.highlightAsNew = false;
    await event.save();
  }

  return formatEvent(event);
}

async function createEvent(data, userId) {
  const duplicate = await findDuplicateTitle(data.title);
  if (duplicate) {
    const err = new Error(`An event titled "${duplicate.title}" already exists`);
    err.status = 409;
    throw err;
  }

  const baseSlug = slugify(data.title);
  const slug = await ensureUniqueSlug(baseSlug);
  const scheduleDate = new Date(`${data.scheduleDate}T12:00:00`);

  await Event.updateMany({ highlightAsNew: true }, { $set: { highlightAsNew: false } });

  const event = await Event.create({
    title: data.title.trim(),
    slug,
    subtitle: data.type,
    scheduleDate,
    location: data.location.trim(),
    type: data.type,
    cameraman: data.cameraman || 'Unassigned',
    badge: 'New Event',
    highlightAsNew: true,
    editorStatus: 'event-scheduled',
    cameramanStatus: 'scheduled',
    createdBy: userId,
  });

  await event.populate('createdBy', 'firstName lastName fullName');
  try {
    await notifyEventCreated(event, userId);
  } catch {
    // notifications should not block event creation
  }
  return formatEvent(event);
}

async function updateEventStatus(eventId, updates) {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  if (updates.editorStatus !== undefined) event.editorStatus = updates.editorStatus;
  if (updates.cameramanStatus !== undefined) event.cameramanStatus = updates.cameramanStatus;

  await event.save();
  await event.populate('createdBy', 'firstName lastName fullName');
  return formatEvent(event);
}

async function listVideosForEvent(eventId, currentUserId) {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  const videos = await Video.find({ event: eventId })
    .populate('uploadedBy', 'firstName lastName fullName avatar')
    .sort({ createdAt: -1 });

  return videos.map((v) => formatVideo(v, currentUserId));
}

async function createVideo(eventId, data, userId) {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  const baseSlug = slugify(data.title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const video = await Video.create({
    event: eventId,
    title: data.title.trim(),
    slug,
    type: data.type,
    videoUrl: data.videoUrl?.trim() || '',
    description: data.description?.trim() || '',
    platforms: data.platforms || [],
    uploadedBy: userId,
  });

  await video.populate('uploadedBy', 'firstName lastName fullName avatar');
  return formatVideo(video, userId);
}

async function updateVideo(videoId, data, userId) {
  const video = await Video.findById(videoId).populate('uploadedBy', 'firstName lastName fullName avatar');
  if (!video) {
    const err = new Error('Video not found');
    err.status = 404;
    throw err;
  }

  if (video.uploadedBy._id.toString() !== userId) {
    const err = new Error('You can only edit videos you uploaded');
    err.status = 403;
    throw err;
  }

  if (data.title !== undefined) video.title = data.title.trim();
  if (data.type !== undefined) video.type = data.type;
  if (data.videoUrl !== undefined) video.videoUrl = data.videoUrl.trim();
  if (data.description !== undefined) video.description = data.description.trim();
  if (data.platforms !== undefined) video.platforms = data.platforms;

  await video.save();
  return formatVideo(video, userId);
}

async function deleteVideo(videoId, userId) {
  const video = await Video.findById(videoId);
  if (!video) {
    const err = new Error('Video not found');
    err.status = 404;
    throw err;
  }

  if (video.uploadedBy.toString() !== userId) {
    const err = new Error('You can only delete videos you uploaded');
    err.status = 403;
    throw err;
  }

  await video.deleteOne();
  return { success: true };
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEventStatus,
  listVideosForEvent,
  createVideo,
  updateVideo,
  deleteVideo,
};
