const mongoose = require('mongoose');
const Report = require('../models/Report');
const ReportValue = require('../models/ReportValue');
const ReportSummary = require('../models/ReportSummary');
const ocrService = require('../services/ocrService');
const sosAlertService = require('../services/sosAlertService');
const EmergencyContact = require('../models/EmergencyContact');
const User = require('../models/User');

async function getUserFromReq(req) {
  const userId = req.user?.id;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    return await User.findById(userId);
  }
  if (req.user?.email) {
    return await User.findOne({ email: req.user.email.toLowerCase() });
  }
  return null;
}

exports.getReports = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const reports = await Report.find({ user_id: user._id }).sort({ created_at: -1 });

    const populated = await Promise.all(
      reports.map(async (r) => {
        const values = await ReportValue.find({ report_id: r._id });
        const summaryObj = await ReportSummary.findOne({ report_id: r._id });

        const rObj = r.toObject();
        return {
          ...rObj,
          id: r._id.toHexString(),
          biomarkers: values.map(v => ({
            id: v._id.toHexString(),
            name: v.biomarker_name,
            value: isNaN(Number(v.value)) ? v.value : Number(v.value),
            unit: v.unit,
            refRange: v.reference_range,
            status: v.status_flag,
            category: v.category
          })),
          aiSummary: summaryObj ? summaryObj.plain_language_summary : "",
          keyFindings: summaryObj ? summaryObj.key_findings : [],
          recommendations: {
            lifestyle: summaryObj ? summaryObj.lifestyle_advice : [],
            medical: summaryObj ? summaryObj.clinical_advice : []
          }
        };
      })
    );

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

exports.uploadReport = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No report file provided. Please upload a PDF, PNG, or JPG document." });
    }

    const file = req.file;
    console.log(`[REPORT ENGINE] Processing uploaded report: "${file.originalname}" (${file.size} bytes) for user ${user.email}`);

    const ocrResult = await ocrService.processReportFile(file);

    const newReport = await Report.create({
      user_id: user._id,
      title: file.originalname.replace(/\.[^/.]+$/, "") || "Uploaded Lab Report",
      lab_name: ocrResult.labName || "Diagnostic Pathology Center",
      doctor_name: ocrResult.doctorName || "Consulting Care Physician",
      report_date: ocrResult.date || new Date().toISOString().split('T')[0],
      file_name: file.originalname,
      file_type: file.mimetype,
      ocr_confidence: ocrResult.ocrConfidence || "99.2%",
      status_flag: ocrResult.status || "Analyzed"
    });

    if (ocrResult.biomarkers && ocrResult.biomarkers.length > 0) {
      const valuesToInsert = ocrResult.biomarkers.map(bm => ({
        report_id: newReport._id,
        biomarker_name: bm.name,
        value: String(bm.value),
        unit: bm.unit || '',
        reference_range: bm.refRange || bm.referenceRange || '',
        status_flag: bm.status || 'Normal',
        category: bm.category || 'Clinical'
      }));
      await ReportValue.insertMany(valuesToInsert);
    }

    await ReportSummary.create({
      report_id: newReport._id,
      plain_language_summary: ocrResult.aiSummary || "Analysis completed.",
      key_findings: ocrResult.keyFindings || [],
      lifestyle_advice: ocrResult.recommendations?.lifestyle || [],
      clinical_advice: ocrResult.recommendations?.medical || []
    });

    const populatedReport = {
      id: newReport._id.toHexString(),
      title: newReport.title,
      labName: newReport.lab_name,
      doctorName: newReport.doctor_name,
      date: newReport.report_date,
      file_name: newReport.file_name,
      file_type: newReport.file_type,
      ocrConfidence: newReport.ocr_confidence,
      status: newReport.status_flag,
      statusType: ocrResult.statusType || 'normal',
      biomarkers: ocrResult.biomarkers || [],
      aiSummary: ocrResult.aiSummary,
      keyFindings: ocrResult.keyFindings || [],
      recommendations: ocrResult.recommendations || { lifestyle: [], medical: [] }
    };

    res.status(201).json({ report: populatedReport });
  } catch (error) {
    next(error);
  }
};
