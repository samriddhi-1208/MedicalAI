require('dotenv').config();
const app = require('./app');
const constants = require('./constants');
const connectDB = require('./config/db');
const seedDatabase = require('./seed/seedData');

const PORT = constants.PORT || process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB Atlas
    await connectDB();

    // 2. Seed initial patient data if database is empty
    await seedDatabase();

    // 3. Listen on HTTP Port
    app.listen(PORT, () => {
      console.log('\n=============================================================');
      console.log(`🏥 MedGuardian AI Backend API active on Port ${PORT}`);
      console.log(`➜ REST API Base: http://localhost:${PORT}/api`);
      console.log(`➜ Health Status: http://localhost:${PORT}/api/health`);
      console.log('=============================================================\n');
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error.');
    process.exit(1);
  }
};

startServer();
