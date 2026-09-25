const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('MONGODB_URI environment variable is missing in server/.env');
    return;
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB Atlas connected successfully.');
  } catch (error) {
    console.warn('MongoDB Atlas connection note:', error.message || 'Database connection error');
  }
};

module.exports = connectDB;
