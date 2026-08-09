const mongoose = require('mongoose');
const Report = require('../models/Report');
const ReportValue = require('../models/ReportValue');
const ReportSummary = require('../models/ReportSummary');
const ocrService = require('../services/ocrService');
const sosAlertService = require('../services/sosAlertService');
const EmergencyContact = require('../models/EmergencyContact');
const User = require('../models/User');

// Helper to safely find user from req without Mongoose ObjectId CastError
async function getUserFromReq(req) {
  const userId = req.user?.id;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const found = await User.findById(userId);
    if (found) return found;
  }
  if (req.user?.email) {
    const foundByEmail = await User.findOne({ email: req.user.email.toLowerCase() });
    if (foundByEmail) return foundByEmail;
  }
  return await User.findOne();
}

exports.getReports = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.json([]);
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
          biomarkers: values.map(v => ({ ...v.toObject(), id: v._id.toHexString() })),
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
    const file = req.file || { originalname: "CBC_Lab_Report_2026.pdf", size: 2400000, mimetype: "application/pdf" };
    const user = await getUserFromReq(req);

    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const ocrResult = await ocrService.processReportFile(file);

    const newReport = await Report.create({
      user_id: user._id,
      title: file.originalname.replace(/\.[^/.]+$/, ""),
      lab_name: ocrResult.labName,
      doctor_name: ocrResult.doctorName,
      report_date: ocrResult.date,
      file_name: file.originalname,
      file_type: file.mimetype,
      ocr_confidence: ocrResult.ocrConfidence,
      status_flag: ocrResult.status
    });

    if (ocrResult.biomarkers && ocrResult.biomarkers.length > 0) {
      const valuesToInsert = ocrResult.biomarkers.map(bm => ({
        report_id: newReport._id,
        biomarker_name: bm.name,
        value: String(bm.value),
        unit: bm.unit,
        reference_range: bm.refRange,
        status_flag: bm.status,
        category: bm.category
      }));
      await ReportValue.insertMany(valuesToInsert);
    }

    await ReportSummary.create({
      report_id: newReport._id,
      plain_language_summary: ocrResult.aiSummary,
      key_findings: ocrResult.keyFindings || [],
      lifestyle_advice: ocrResult.recommendations?.lifestyle || [],
      clinical_advice: ocrResult.recommendations?.medical || []
    });

    const criticals = ocrResult.biomarkers.filter(b => b.status === 'Critical' || b.status === 'High');
    if (criticals.length > 0) {
      const contacts = await EmergencyContact.find({ user_id: user._id });
      await sosAlertService.dispatchSOSAlert(user, contacts, {
        triggerType: "Automated Critical Biomarker Alert",
        notes: `Extracted critical values: ${criticals.map(c => `${c.name} = ${c.value} ${c.unit}`).join(', ')}`
      });
    }

    res.status(201).json({ report: newReport, ocrResult });
  } catch (error) {
    next(error);
  }
};
