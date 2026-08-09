const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Report = require('../src/models/Report');
const ReportValue = require('../src/models/ReportValue');
const ReportSummary = require('../src/models/ReportSummary');
const EmergencyContact = require('../src/models/EmergencyContact');
const SOSEvent = require('../src/models/SOSEvent');
const User = require('../src/models/User');
const { authenticateToken } = require('../middleware/authMiddleware');
const { processReportFile } = require('../services/ocrService');
const { sendEmergencySOSAlert } = require('../services/sosAlertService');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// POST /api/reports/upload
router.post('/upload', authenticateToken, upload.single('reportFile'), async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) user = await User.findOne();

    const file = req.file || { originalname: req.body.title || 'Complete_Blood_Count.pdf', path: '/uploads/sample.pdf', size: 2400000 };
    const ocrResult = processReportFile(file, file.originalname);

    const reportRecord = await Report.create({
      user_id: user._id,
      title: file.originalname.replace(/\.[^/.]+$/, "") || "Medical Diagnostic Report",
      lab_name: "Apex Clinical Laboratories",
      doctor_name: "Dr. Aris Thorne",
      file_name: file.originalname,
      status_flag: ocrResult.hasCriticalFlag ? "Attention Needed" : "Normal"
    });

    if (ocrResult.structuredValues && ocrResult.structuredValues.length > 0) {
      const valuesToInsert = ocrResult.structuredValues.map(val => ({
        report_id: reportRecord._id,
        biomarker_name: val.test_name,
        value: String(val.value),
        unit: val.unit,
        reference_range: val.reference_range,
        status_flag: val.is_critical ? 'High' : 'Normal',
        category: val.category
      }));
      await ReportValue.insertMany(valuesToInsert);
    }

    await ReportSummary.create({
      report_id: reportRecord._id,
      plain_language_summary: ocrResult.summary.summary_text,
      key_findings: ocrResult.summary.key_findings || [],
      lifestyle_advice: ocrResult.summary.recommendations?.lifestyle || [],
      clinical_advice: ocrResult.summary.recommendations?.medical || []
    });

    let sosTriggered = false;
    if (ocrResult.hasCriticalFlag) {
      const contacts = await EmergencyContact.find({ user_id: user._id });
      const sosRes = await sendEmergencySOSAlert({
        userName: user.full_name,
        contacts: contacts.length > 0 ? contacts : [{ name: 'Dr. Aris Thorne', email: 'dr.thorne@apexhealth.org', phone: '+1-555-911-4040' }],
        latitude: 28.6139,
        longitude: 77.2090,
        triggerType: "AUTOMATIC SOS (Critical Biomarker Flag Detected)",
        notes: "System audit auto-triggered SOS alert based on clinical reference threshold breach."
      });

      await SOSEvent.create({
        user_id: user._id,
        trigger_type: "Automatic Critical Flag",
        latitude: 28.6139,
        longitude: 77.2090,
        status: "Dispatched",
        notes: JSON.stringify(sosRes.dispatchedTo || {})
      });
      sosTriggered = true;
    }

    res.status(201).json({
      message: "Report processed and saved to longitudinal database",
      report: reportRecord,
      values: ocrResult.structuredValues,
      summary: ocrResult.summary,
      sosTriggered,
      ocrConfidence: ocrResult.ocrConfidence
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports
router.get('/', authenticateToken, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (!user) user = await User.findOne();

    const reports = await Report.find({ user_id: user._id }).sort({ created_at: -1 });
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const values = await ReportValue.find({ report_id: report._id });
    const summaryRecord = await ReportSummary.findOne({ report_id: report._id });

    res.json({
      report,
      values,
      summary: summaryRecord ? {
        summary_text: summaryRecord.plain_language_summary,
        key_findings: summaryRecord.key_findings,
        recommendations: {
          lifestyle: summaryRecord.lifestyle_advice,
          medical: summaryRecord.clinical_advice
        }
      } : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
