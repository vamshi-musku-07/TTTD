const mongoose = require('mongoose');
const { mongoUri } = require('./env');
const { seedSuperAdmin } = require('./seed');

async function connectDB() {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  console.log('[db] Connected to MongoDB');
  await seedSuperAdmin();
}

module.exports = { connectDB };
