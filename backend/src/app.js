const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { clientUrl } = require('./config/env');
const authRoutes = require('./routes/auth.routes');
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
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
