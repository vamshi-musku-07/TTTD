require('dotenv').config();

const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'GOOGLE_CLIENT_ID'];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Warning: ${key} is not set`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
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
  isDev: (process.env.NODE_ENV || 'development') !== 'production',
};
