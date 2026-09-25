require('dotenv').config();
const app = require('./app');
const constants = require('./constants');
const connectDB = require('./config/db');
const seedDatabase = require('./seed/seedData');

const PORT = process.env.PORT || constants.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDB();

    // 2. Seed database if empty
    await seedDatabase();
  } catch (err) {
    console.warn('MongoDB Atlas connection note on startup:', err.message || err);
  } finally {
    // 3. Always bind HTTP server to PORT so Render service remains 100% online
    app.listen(PORT, () => {
      console.log('\n=============================================================');
      console.log(`🏥 MedGuardian AI Backend API active on Port ${PORT}`);
      console.log(`➜ REST API Base: http://localhost:${PORT}/api`);
      console.log(`➜ Health Status: http://localhost:${PORT}/api/health`);
      console.log('=============================================================\n');
    });
  }
};

startServer();
