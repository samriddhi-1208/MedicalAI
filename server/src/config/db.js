const mongoose = require('mongoose');

// Disable command buffering so operations immediately failover to memory cache when DB is offline
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('MONGODB_URI environment variable is missing in server/.env');
    return;
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB Atlas connected successfully.');
  } catch (error) {
    console.warn('MongoDB Atlas connection note:', error.message || 'Database connection error');
    try {
      await mongoose.disconnect();
    } catch (_) {}
  }
};

module.exports = connectDB;
