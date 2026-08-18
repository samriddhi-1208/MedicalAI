const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const medicinesRoutes = require('./routes/medicinesRoutes');
const sosRoutes = require('./routes/sosRoutes');
const hospitalsRoutes = require('./routes/hospitalsRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    system: 'MedGuardian AI REST Engine',
    timestamp: new Date().toISOString()
  });
});

// Primary API Routes (with /api prefix)
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/emergency', sosRoutes);
app.use('/api/hospitals', hospitalsRoutes);
app.use('/api/vitals', vitalsRoutes);

// Fallback API Routes (without /api prefix for 100% endpoint resilience)
app.use('/auth', authRoutes);
app.use('/reports', reportsRoutes);
app.use('/medicines', medicinesRoutes);
app.use('/sos', sosRoutes);
app.use('/emergency', sosRoutes);
app.use('/hospitals', hospitalsRoutes);
app.use('/vitals', vitalsRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
