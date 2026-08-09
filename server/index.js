const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded medical reports
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes per System Architecture Spec
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reports', require('./routes/reportsRoutes'));
app.use('/api/medicines', require('./routes/medicinesRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/hospitals', require('./routes/hospitalsRoutes'));
app.use('/api/vitals', require('./routes/vitalsRoutes'));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "MedGuardian AI Backend REST API",
    architecture: "System Design Spec v1.0",
    timestamp: new Date().toISOString()
  });
});

// Start Express REST API Server
app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🏥 MedGuardian AI Backend API Server active on Port ${PORT}`);
  console.log(`➜ REST API Base: http://localhost:${PORT}/api`);
  console.log(`➜ Health Status: http://localhost:${PORT}/api/health`);
  console.log(`=============================================================\n`);
});
