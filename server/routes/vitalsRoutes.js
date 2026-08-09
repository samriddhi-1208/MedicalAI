const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

const HISTORIES = {
  Glucose: [
    { date: "Jan 2026", value: 118, targetMax: 100 },
    { date: "Feb 2026", value: 112, targetMax: 100 },
    { date: "Mar 2026", value: 110, targetMax: 100 },
    { date: "Apr 2026", value: 108, targetMax: 100 },
    { date: "May 2026", value: 106, targetMax: 100 },
    { date: "Jun 2026", value: 105, targetMax: 100 },
    { date: "Jul 2026", value: 104, targetMax: 100 }
  ],
  Hemoglobin: [
    { date: "Jan 2026", value: 10.8, targetMin: 12.0, targetMax: 15.5 },
    { date: "Feb 2026", value: 10.9, targetMin: 12.0, targetMax: 15.5 },
    { date: "Mar 2026", value: 11.0, targetMin: 12.0, targetMax: 15.5 },
    { date: "Apr 2026", value: 11.1, targetMin: 12.0, targetMax: 15.5 },
    { date: "May 2026", value: 11.0, targetMin: 12.0, targetMax: 15.5 },
    { date: "Jun 2026", value: 11.3, targetMin: 12.0, targetMax: 15.5 },
    { date: "Jul 2026", value: 11.2, targetMin: 12.0, targetMax: 15.5 }
  ],
  Cholesterol: [
    { date: "Jan 2026", value: 240, targetMax: 200 },
    { date: "Feb 2026", value: 236, targetMax: 200 },
    { date: "Mar 2026", value: 232, targetMax: 200 },
    { date: "Apr 2026", value: 228, targetMax: 200 },
    { date: "May 2026", value: 225, targetMax: 200 },
    { date: "Jun 2026", value: 226, targetMax: 200 },
    { date: "Jul 2026", value: 224, targetMax: 200 }
  ],
  HbA1c: [
    { date: "Jan 2026", value: 6.2, targetMax: 5.7 },
    { date: "Feb 2026", value: 6.1, targetMax: 5.7 },
    { date: "Mar 2026", value: 6.0, targetMax: 5.7 },
    { date: "Apr 2026", value: 5.9, targetMax: 5.7 },
    { date: "May 2026", value: 5.9, targetMax: 5.7 },
    { date: "Jun 2026", value: 5.8, targetMax: 5.7 },
    { date: "Jul 2026", value: 5.8, targetMax: 5.7 }
  ]
};

// GET /api/vitals/timeline?biomarker=Glucose
router.get('/timeline', authenticateToken, (req, res) => {
  const marker = req.query.biomarker || 'Glucose';
  const history = HISTORIES[marker] || HISTORIES['Glucose'];
  res.json({ biomarker: marker, history });
});

module.exports = router;
