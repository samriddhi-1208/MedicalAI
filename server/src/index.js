require('dotenv').config();
const app = require('./app');
const constants = require('./constants');
const connectDB = require('./config/db');
const seedDatabase = require('./seed/seedData');

const PORT = process.env.PORT || constants.PORT || 5000;

const startServer = () => {
  // 1. Immediately bind HTTP server to PORT so backend is responsive without waiting for DB timeouts
  const server = app.listen(PORT, () => {
    console.log('\n=============================================================');
    console.log(`🏥 MedGuardian AI Backend API active on Port ${PORT}`);
    console.log(`➜ REST API Base: http://localhost:${PORT}/api`);
    console.log(`➜ Health Status: http://localhost:${PORT}/api/health`);
    console.log('=============================================================\n');
  });

  // 2. Connect to MongoDB Atlas asynchronously in background
  connectDB().then(async () => {
    if (require('mongoose').connection && require('mongoose').connection.readyState === 1) {
      await seedDatabase();
    }
  }).catch((err) => {
    console.warn('MongoDB Atlas connection note on startup:', err.message || err);
  });

  return server;
};

startServer();
