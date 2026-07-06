const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { google } = require('../config/env');
const {
  signAccessToken,
  signRefreshToken,
  hashToken,
  generateSecureToken,
} = require('../utils/tokens');
const { validatePasswordStrength } = require('../utils/password');
const { sendVerificationEmail } = require('./email.service');

const googleClient = new OAuth2Client(google.clientId);

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    avatar: user.avatar,
    authProvider: user.authProvider,
    isEmailVerified: user.isEmailVerified,
    role: user.role || 'editor',
    createdAt: user.createdAt,
  };
}

function issueTokens(user) {
  const userId = user._id.toString();
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);
  return { accessToken, refreshToken };
}

async function persistRefreshToken(user, refreshToken) {
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
}

async function registerLocal({ email, password, firstName, lastName, acceptTerms }) {
  if (!acceptTerms) {
    const err = new Error('You must accept the terms and privacy policy');
    err.status = 400;
    throw err;
  }

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    const err = new Error(`Password requirements: ${passwordCheck.failures.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.status = 409;
    throw err;
  }

  const verificationToken = generateSecureToken();

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    authProvider: 'local',
    isEmailVerified: false,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpires: new Date(Date.now() + VERIFICATION_EXPIRY_MS),
    acceptedTermsAt: new Date(),
  });

  await sendVerificationEmail(user, verificationToken);

  const tokens = issueTokens(user);
  await persistRefreshToken(user, tokens.refreshToken);

  return { user: sanitizeUser(user), ...tokens };
}

async function verifyGoogleCredential(credential) {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: google.clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    const err = new Error('Google email is not verified');
    err.status = 400;
    throw err;
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    firstName: payload.given_name || payload.name?.split(' ')[0] || 'User',
    lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '',
    avatar: payload.picture || null,
  };
}

async function registerOrLoginGoogle(credential, acceptTerms) {
  const profile = await verifyGoogleCredential(credential);

  let user = await User.findOne({
    $or: [{ googleId: profile.googleId }, { email: profile.email }],
  }).select('+refreshTokenHash');

  if (user) {
    if (!user.googleId) {
      user.googleId = profile.googleId;
      user.authProvider = user.password ? 'local' : 'google';
    }
    if (profile.avatar) user.avatar = profile.avatar;
    user.isEmailVerified = true;
    user.lastLoginAt = new Date();
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });
  } else {
    if (!acceptTerms) {
      const err = new Error('You must accept the terms and privacy policy');
      err.status = 400;
      throw err;
    }

    user = await User.create({
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName || 'User',
      avatar: profile.avatar,
      googleId: profile.googleId,
      authProvider: 'google',
      isEmailVerified: true,
      acceptedTermsAt: new Date(),
      lastLoginAt: new Date(),
    });
  }

  const tokens = issueTokens(user);
  await persistRefreshToken(user, tokens.refreshToken);

  return { user: sanitizeUser(user), ...tokens };
}

async function verifyEmail(token) {
  const hashed = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    const err = new Error('Invalid or expired verification link');
    err.status = 400;
    throw err;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return sanitizeUser(user);
}

async function resendVerification(email) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+emailVerificationToken +emailVerificationExpires'
  );

  if (!user || user.isEmailVerified) {
    return { sent: true };
  }

  const verificationToken = generateSecureToken();
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_EXPIRY_MS);
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail(user, verificationToken);
  return { sent: true };
}

async function loginLocal({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +refreshTokenHash +failedLoginAttempts +lockUntil');

  if (!user || !user.password) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  if (user.isLocked()) {
    const err = new Error('Account temporarily locked. Try again later.');
    err.status = 423;
    throw err;
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= LOCK_THRESHOLD) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save({ validateBeforeSave: false });
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = issueTokens(user);
  await persistRefreshToken(user, tokens.refreshToken);

  return { user: sanitizeUser(user), ...tokens };
}

async function refreshSession(refreshToken) {
  const { verifyRefreshToken } = require('../utils/tokens');
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  const tokens = issueTokens(user);
  await persistRefreshToken(user, tokens.refreshToken);
  return { user: sanitizeUser(user), ...tokens };
}

async function logout(userId) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return sanitizeUser(user);
}

module.exports = {
  registerLocal,
  registerOrLoginGoogle,
  verifyEmail,
  resendVerification,
  loginLocal,
  refreshSession,
  logout,
  getMe,
};
