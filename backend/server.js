const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { port, host, nodeEnv, serveFrontend, clientUrls } = require('./src/config/env');

async function start() {
  await connectDB();

  app.listen(port, host, () => {
    console.log(`[server] ${nodeEnv} — http://${host}:${port}`);
    console.log(`[cors] Allowed origins: ${clientUrls.join(', ') || '(none)'}`);
    if (serveFrontend) {
      console.log('[server] Serving frontend static build');
    }
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err.message);
  process.exit(1);
});
