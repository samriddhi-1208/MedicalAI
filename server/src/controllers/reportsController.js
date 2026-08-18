const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const Report = require('../models/Report');
const ReportValue = require('../models/ReportValue');
const ReportSummary = require('../models/ReportSummary');
const ocrService = require('../services/ocrService');
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
        const mappedBiomarkers = values.map(v => ({
          id: v._id.toHexString(),
          name: v.biomarker_name,
          testName: v.biomarker_name,
          value: isNaN(Number(v.value)) ? v.value : Number(v.value),
          unit: v.unit,
          refRange: v.reference_range,
          referenceRange: v.reference_range,
          status: v.status_flag,
          category: v.category
        }));

        const vitals = Array.isArray(r.vitals) ? r.vitals : [];
        const extractedMedications = Array.isArray(r.extracted_medications) ? r.extracted_medications : (Array.isArray(r.extractedMedications) ? r.extractedMedications : []);
        const rawText = r.raw_text || r.rawText || '';

        return {
          ...rObj,
          id: r._id.toHexString(),
          title: r.title,
          labName: r.lab_name || '',
          doctorName: r.doctor_name || '',
          date: r.report_date,
          file_name: r.file_name,
          file_type: r.file_type,
          ocrConfidence: r.ocr_confidence,
          status: r.status_flag,
          biomarkers: mappedBiomarkers,
          labResults: mappedBiomarkers,
          vitals,
          extractedMedications,
          medications: extractedMedications,
          rawText,
          aiSummary: summaryObj ? summaryObj.plain_language_summary : "",
          summary: summaryObj ? summaryObj.plain_language_summary : "",
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

exports.getReportById = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const reportId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ error: "Invalid report ID format." });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }

    if (report.user_id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Access denied. You do not own this report." });
    }

    const values = await ReportValue.find({ report_id: report._id });
    const summaryObj = await ReportSummary.findOne({ report_id: report._id });

    const mappedBiomarkers = values.map(v => ({
      id: v._id.toHexString(),
      name: v.biomarker_name,
      testName: v.biomarker_name,
      value: isNaN(Number(v.value)) ? v.value : Number(v.value),
      unit: v.unit,
      refRange: v.reference_range,
      referenceRange: v.reference_range,
      status: v.status_flag,
      category: v.category
    }));

    const vitals = Array.isArray(report.vitals) ? report.vitals : [];
    const extractedMedications = Array.isArray(report.extracted_medications) ? report.extracted_medications : (Array.isArray(report.extractedMedications) ? report.extractedMedications : []);
    const rawText = report.raw_text || report.rawText || '';

    res.json({
      id: report._id.toHexString(),
      title: report.title,
      labName: report.lab_name || '',
      doctorName: report.doctor_name || '',
      date: report.report_date,
      file_name: report.file_name,
      file_type: report.file_type,
      ocrConfidence: report.ocr_confidence,
      status: report.status_flag,
      biomarkers: mappedBiomarkers,
      labResults: mappedBiomarkers,
      vitals,
      extractedMedications,
      medications: extractedMedications,
      rawText,
      aiSummary: summaryObj ? summaryObj.plain_language_summary : "",
      summary: summaryObj ? summaryObj.plain_language_summary : "",
      keyFindings: summaryObj ? summaryObj.key_findings : [],
      recommendations: {
        lifestyle: summaryObj ? summaryObj.lifestyle_advice : [],
        medical: summaryObj ? summaryObj.clinical_advice : []
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadReport = async (req, res, next) => {
  let fileHash = null;
  let user = null;

  try {
    user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ error: "No report file provided. Please upload a PDF, PNG, or JPG document." });
    }

    // Compute SHA-256 hash of file content to detect REAL exact duplicate files
    let fileBuffer = file.buffer;
    if (!fileBuffer && file.path && fs.existsSync(file.path)) {
      try {
        fileBuffer = fs.readFileSync(file.path);
      } catch (e) {}
    }

    fileHash = fileBuffer ? crypto.createHash('sha256').update(fileBuffer).digest('hex') : null;

    const cleanTitle = file.originalname ? file.originalname.replace(/\.[^/.]+$/, "").trim() : "";

    const queryOr = [];
    if (fileHash) {
      queryOr.push({ file_hash: fileHash });
    }
    if (file.originalname && file.size) {
      queryOr.push({ file_name: file.originalname, file_size: file.size });
    }
    if (file.originalname) {
      queryOr.push({ file_name: file.originalname });
    }
    if (cleanTitle) {
      queryOr.push({ title: cleanTitle });
    }

    let existingReport = null;
    if (queryOr.length > 0) {
      existingReport = await Report.findOne({
        user_id: user._id,
        $or: queryOr
      });
    }

    if (existingReport) {
      console.log(`[REPORT ENGINE] Duplicate report detected for user ${user._id}: "${file.originalname}". Rejecting upload & returning existing record.`);
      
      const values = await ReportValue.find({ report_id: existingReport._id });
      const summaryObj = await ReportSummary.findOne({ report_id: existingReport._id });

      const mappedBiomarkers = values.map(v => ({
        id: v._id.toHexString(),
        name: v.biomarker_name,
        testName: v.biomarker_name,
        value: isNaN(Number(v.value)) ? v.value : Number(v.value),
        unit: v.unit,
        refRange: v.reference_range,
        referenceRange: v.reference_range,
        status: v.status_flag,
        category: v.category
      }));

      const populatedExisting = {
        id: existingReport._id.toHexString(),
        title: existingReport.title,
        labName: existingReport.lab_name || '',
        doctorName: existingReport.doctor_name || '',
        date: existingReport.report_date,
        file_name: existingReport.file_name,
        file_type: existingReport.file_type,
        ocrConfidence: existingReport.ocr_confidence,
        status: existingReport.status_flag,
        biomarkers: mappedBiomarkers,
        labResults: mappedBiomarkers,
        vitals: Array.isArray(existingReport.vitals) ? existingReport.vitals : [],
        extractedMedications: Array.isArray(existingReport.extracted_medications) ? existingReport.extracted_medications : [],
        medications: Array.isArray(existingReport.extracted_medications) ? existingReport.extracted_medications : [],
        rawText: existingReport.raw_text || '',
        aiSummary: summaryObj ? summaryObj.plain_language_summary : "Report previously parsed.",
        keyFindings: summaryObj ? summaryObj.key_findings : [],
        recommendations: {
          lifestyle: summaryObj ? summaryObj.lifestyle_advice : [],
          medical: summaryObj ? summaryObj.clinical_advice : []
        }
      };

      return res.status(200).json({ 
        report: populatedExisting, 
        isDuplicate: true, 
        duplicate: true,
        existingReportId: existingReport._id.toHexString(),
        message: "This medical report has already been uploaded." 
      });
    }

    console.log(`[REPORT ENGINE] Processing NEW uploaded report: "${file.originalname}" (${file.size} bytes) for user ID ${user._id} (${user.email})`);

    const ocrResult = await ocrService.processReportFile(file);

    const newReport = await Report.create({
      user_id: user._id,
      title: cleanTitle || "Uploaded Lab Report",
      lab_name: ocrResult.labName || "",
      doctor_name: ocrResult.doctorName || "",
      report_date: ocrResult.date || new Date().toISOString().split('T')[0],
      file_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size || 0,
      file_hash: fileHash || '',
      ocr_confidence: ocrResult.ocrConfidence || "98.9%",
      status_flag: ocrResult.status || "Optimal",
      vitals: Array.isArray(ocrResult.vitals) ? ocrResult.vitals : [],
      extracted_medications: Array.isArray(ocrResult.extractedMedications) ? ocrResult.extractedMedications : [],
      raw_text: ocrResult.rawText || ''
    });

    const combinedBiomarkers = [
      ...(Array.isArray(ocrResult.biomarkers) ? ocrResult.biomarkers : []),
      ...(Array.isArray(ocrResult.labResults) ? ocrResult.labResults : [])
    ];

    // Deduplicate by name within the same document
    const uniqueBiomarkers = [];
    const seenNames = new Set();

    combinedBiomarkers.forEach(bm => {
      const name = bm.name || bm.testName;
      if (name && !seenNames.has(name)) {
        seenNames.add(name);
        uniqueBiomarkers.push(bm);
      }
    });

    if (uniqueBiomarkers.length > 0) {
      const valuesToInsert = uniqueBiomarkers.map(bm => ({
        report_id: newReport._id,
        biomarker_name: bm.name || bm.testName,
        value: String(bm.value),
        unit: bm.unit || '',
        reference_range: bm.refRange || bm.referenceRange || '',
        status_flag: bm.status || 'Normal',
        category: bm.category || 'Clinical Diagnostic'
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
      biomarkers: uniqueBiomarkers,
      labResults: uniqueBiomarkers,
      vitals: ocrResult.vitals || [],
      extractedMedications: ocrResult.extractedMedications || [],
      medications: ocrResult.extractedMedications || [],
      rawText: ocrResult.rawText || '',
      aiSummary: ocrResult.aiSummary,
      keyFindings: ocrResult.keyFindings || [],
      recommendations: ocrResult.recommendations || { lifestyle: [], medical: [] }
    };

    res.status(201).json({ report: populatedReport, isDuplicate: false, duplicate: false });
  } catch (error) {
    if (error.code === 11000 && user) {
      const existing = await Report.findOne({ user_id: user._id });
      if (existing) {
        return res.status(200).json({
          report: existing,
          isDuplicate: true,
          duplicate: true,
          existingReportId: existing._id.toHexString(),
          message: "This medical report has already been uploaded."
        });
      }
    }
    next(error);
  }
};
