const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { port } = require('./src/config/env');

async function start() {
  await connectDB();

  app.listen(port, () => {
    console.log(`[server] Running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err.message);
  process.exit(1);
});
