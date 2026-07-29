const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { clientUrls, serveFrontend, frontendDistPath, isProd } = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const eventsRoutes = require('./routes/events.routes');
const videosRoutes = require('./routes/videos.routes');
const complaintsRoutes = require('./routes/complaints.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const teamRoutes = require('./routes/team.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const uploadsRoutes = require('./routes/uploads.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || clientUrls.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Active-Role'],
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/uploads', uploadsRoutes);

if (serveFrontend) {
  const distPath =
    frontendDistPath || path.resolve(__dirname, '../../frontend/dist');

  app.use(express.static(distPath, { index: false, maxAge: isProd ? '1d' : 0 }));

  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
