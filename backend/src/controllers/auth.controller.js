const authService = require('../services/auth.service');
const { jwt: jwtConfig, isDev } = require('../config/env');

const REFRESH_COOKIE = 'tttd_refresh';

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: !isDev,
    sameSite: isDev ? 'lax' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
}

function sendAuthResponse(res, statusCode, data) {
  setRefreshCookie(res, data.refreshToken);
  res.status(statusCode).json({
    success: true,
    user: data.user,
    accessToken: data.accessToken,
  });
}

async function signup(req, res, next) {
  try {
    const result = await authService.registerLocal(req.validated);
    sendAuthResponse(res, 201, result);
  } catch (err) {
    next(err);
  }
}

async function googleAuth(req, res, next) {
  try {
    const { credential, acceptTerms } = req.validated;
    const result = await authService.registerOrLoginGoogle(credential, acceptTerms ?? true);
    sendAuthResponse(res, 200, result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginLocal(req.validated);
    sendAuthResponse(res, 200, result);
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }
    const result = await authService.refreshSession(refreshToken);
    sendAuthResponse(res, 200, result);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.userId);
    clearRefreshCookie(res);
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.userId);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const token = req.body.token || req.query.token;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }
    const user = await authService.verifyEmail(token);
    res.json({ success: true, message: 'Email verified successfully', user });
  } catch (err) {
    next(err);
  }
}

async function resendVerification(req, res, next) {
  try {
    await authService.resendVerification(req.validated.email);
    res.json({
      success: true,
      message: 'If an unverified account exists, a verification email has been sent.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  googleAuth,
  login,
  refresh,
  logout,
  me,
  verifyEmail,
  resendVerification,
};
