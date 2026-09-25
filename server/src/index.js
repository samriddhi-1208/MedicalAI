require('dotenv').config();
const app = require('./app');
const constants = require('./constants');
const connectDB = require('./config/db');
const seedDatabase = require('./seed/seedData');

const PORT = process.env.PORT || constants.PORT || 5000;

// 1. Immediately bind HTTP server to PORT for instant Render health checks & zero-timeout startup
const server = app.listen(PORT, () => {
  console.log('\n=============================================================');
  console.log(`🏥 MedGuardian AI Backend API active on Port ${PORT}`);
  console.log(`➜ REST API Base: http://localhost:${PORT}/api`);
  console.log(`➜ Health Status: http://localhost:${PORT}/api/health`);
  console.log('=============================================================\n');
});

// 2. Connect to MongoDB Atlas asynchronously in the background
connectDB()
  .then(() => {
    console.log('MongoDB Atlas connected successfully.');
    return seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB Atlas Connection Warning:', err.message || err);
  });
