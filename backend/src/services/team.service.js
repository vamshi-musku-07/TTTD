const User = require('../models/User');
const Event = require('../models/Event');
const Video = require('../models/Video');
const { validatePasswordStrength } = require('../utils/password');

const TEAM_LIST_ROLES = ['editor', 'admin'];

const ROLE_TITLES = {
  editor: 'Editor',
  admin: 'Admin',
};

function splitName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function formatDisplayName(firstName, lastName) {
  if (!firstName) return '';
  if (firstName === lastName) return firstName;
  return `${firstName} ${lastName}`.trim();
}

function formatInitials(firstName, lastName) {
  const name = formatDisplayName(firstName, lastName);
  if (!name) return 'U';
  return name[0].toUpperCase();
}

function formatJoinedAt(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function normalizeAvatar(avatar) {
  if (avatar === undefined) return undefined;
  if (avatar === null || avatar === '') return null;
  return avatar;
}

async function buildMemberStats(user) {
  const videos = await Video.find({ uploadedBy: user._id });
  const videosUploaded = videos.length;
  const eventsEdited = new Set(videos.map((video) => video.event.toString())).size;
  const eventsManaged = user.role === 'admin' ? await Event.countDocuments() : 0;

  return {
    videosUploaded,
    eventsEdited,
    eventsManaged,
  };
}

async function formatTeamMember(user) {
  const stats = await buildMemberStats(user);
  const name = formatDisplayName(user.firstName, user.lastName);

  return {
    id: user._id.toString(),
    name,
    role: user.role,
    title: ROLE_TITLES[user.role] || user.role,
    email: user.email,
    avatar: user.avatar,
    initials: formatInitials(user.firstName, user.lastName),
    status: 'active',
    joinedAt: formatJoinedAt(user.createdAt),
    ...stats,
  };
}

async function listTeamMembers() {
  const users = await User.find({ role: { $in: TEAM_LIST_ROLES } }).sort({ createdAt: -1 });
  return Promise.all(users.map(formatTeamMember));
}

async function createTeamMember(data) {
  const passwordCheck = validatePasswordStrength(data.password);
  if (!passwordCheck.valid) {
    const err = new Error(`Password requirements: ${passwordCheck.failures.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    const err = new Error('A user with this email already exists');
    err.status = 409;
    throw err;
  }

  const { firstName, lastName } = splitName(data.name);
  const avatar = normalizeAvatar(data.avatar);

  const user = await User.create({
    email: data.email.toLowerCase(),
    password: data.password,
    firstName,
    lastName,
    role: 'editor',
    avatar: avatar === undefined ? null : avatar,
    isEmailVerified: true,
    acceptedTermsAt: new Date(),
  });

  return formatTeamMember(user);
}

async function updateTeamMember(userId, data) {
  const user = await User.findById(userId);
  if (!user || user.role !== 'editor') {
    const err = new Error('Editor not found');
    err.status = 404;
    throw err;
  }

  if (data.email && data.email.toLowerCase() !== user.email) {
    const duplicate = await User.findOne({ email: data.email.toLowerCase() });
    if (duplicate) {
      const err = new Error('A user with this email already exists');
      err.status = 409;
      throw err;
    }
    user.email = data.email.toLowerCase();
  }

  if (data.name) {
    const { firstName, lastName } = splitName(data.name);
    user.firstName = firstName;
    user.lastName = lastName;
  }

  if (data.avatar !== undefined) {
    user.avatar = normalizeAvatar(data.avatar);
  }

  if (data.password) {
    const passwordCheck = validatePasswordStrength(data.password);
    if (!passwordCheck.valid) {
      const err = new Error(`Password requirements: ${passwordCheck.failures.join(', ')}`);
      err.status = 400;
      throw err;
    }
    user.password = data.password;
  }

  try {
    await user.save();
  } catch (saveErr) {
    if (saveErr.name === 'ValidationError') {
      const err = new Error(
        Object.values(saveErr.errors || {})
          .map((e) => e.message)
          .join(', ') || 'Validation failed'
      );
      err.status = 400;
      throw err;
    }
    throw saveErr;
  }

  return formatTeamMember(user);
}

async function deleteTeamMember(userId, requesterId) {
  if (userId === requesterId) {
    const err = new Error('You cannot remove your own account');
    err.status = 400;
    throw err;
  }

  const user = await User.findById(userId);
  if (!user || user.role !== 'editor') {
    const err = new Error('Editor not found');
    err.status = 404;
    throw err;
  }

  await User.findByIdAndDelete(userId);
  return { id: userId };
}

module.exports = {
  listTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  splitName,
  formatDisplayName,
  normalizeAvatar,
};
