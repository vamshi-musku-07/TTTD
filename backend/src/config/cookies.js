const path = require('path');
const { cookies, isDev } = require('./env');

const REFRESH_COOKIE = 'tttd_refresh';
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: cookies.secure,
    sameSite: cookies.sameSite,
    domain: cookies.domain,
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/api/auth',
  };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE, refreshToken, getRefreshCookieOptions());
}

function clearRefreshCookie(res) {
  const { path: cookiePath, secure, sameSite, domain } = getRefreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE, { path: cookiePath, secure, sameSite, domain });
}

module.exports = {
  REFRESH_COOKIE,
  getRefreshCookieOptions,
  setRefreshCookie,
  clearRefreshCookie,
};
