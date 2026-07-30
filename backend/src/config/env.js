require('dotenv').config();

const PLACEHOLDER_SECRETS = new Set([
  'change-me-access-secret-min-32-chars',
  'change-me-refresh-secret-min-32-chars',
]);

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const isDev = !isProd;

function parseClientUrls() {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173';
  return raw
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

function validateProductionEnv() {
  if (!isProd) return;

  const required = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'GOOGLE_CLIENT_ID',
    'CLIENT_URL',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.error(`[env] Missing required production variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
    const value = process.env[key];
    if (value.length < 32 || PLACEHOLDER_SECRETS.has(value)) {
      console.error(`[env] ${key} must be a strong secret (32+ chars) in production`);
      process.exit(1);
    }
  }
}

if (isDev) {
  for (const key of [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'GOOGLE_CLIENT_ID',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ]) {
    if (!process.env[key]) {
      console.warn(`[env] Warning: ${key} is not set`);
    }
  }
}

validateProductionEnv();

const clientUrls = parseClientUrls();

module.exports = {
  nodeEnv,
  isDev,
  isProd,
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || '0.0.0.0',
  mongoUri: process.env.MONGODB_URI,
  clientUrl: clientUrls[0],
  clientUrls,
  serveFrontend: process.env.SERVE_FRONTEND === 'true',
  frontendDistPath: process.env.FRONTEND_DIST_PATH,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'TTTD <noreply@localhost>',
  },
  cookies: {
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd,
    sameSite: process.env.COOKIE_SAME_SITE || (isDev ? 'lax' : 'strict'),
    domain: process.env.COOKIE_DOMAIN || undefined,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'mediaflow',
  },
};
