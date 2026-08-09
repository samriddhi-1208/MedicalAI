const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI environment variable is missing in server/.env');
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message || 'Database connection error');
    throw error;
  }
};

module.exports = connectDB;
