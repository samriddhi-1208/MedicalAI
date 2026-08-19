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
          patientName: r.patient_name || 'Unspecified',
          labName: r.lab_name || '',
          doctorName: r.doctor_name || '',
          reportDate: r.report_date,
          date: r.report_date,
          uploadedAt: r.created_at ? r.created_at.toISOString().split('T')[0] : r.report_date,
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
      patientName: report.patient_name || 'Unspecified',
      labName: report.lab_name || '',
      doctorName: report.doctor_name || '',
      reportDate: report.report_date,
      date: report.report_date,
      uploadedAt: report.created_at ? report.created_at.toISOString().split('T')[0] : report.report_date,
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

    // Compute SHA-256 hash of file content
    let fileBuffer = file.buffer;
    if (!fileBuffer && file.path && fs.existsSync(file.path)) {
      try {
        fileBuffer = fs.readFileSync(file.path);
      } catch (e) {}
    }

    fileHash = fileBuffer ? crypto.createHash('sha256').update(fileBuffer).digest('hex') : null;

    const cleanTitle = file.originalname ? file.originalname.replace(/\.[^/.]+$/, "").trim() : "";

    let existingReport = null;
    if (fileHash) {
      existingReport = await Report.findOne({
        user_id: user._id,
        file_hash: fileHash
      });
    }

    if (existingReport) {
      console.log(`[REPORT ENGINE] Duplicate SHA-256 hash report detected for user ${user._id}: "${file.originalname}". Returning existing record.`);
      
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
        patientName: existingReport.patient_name || 'Unspecified',
        labName: existingReport.lab_name || '',
        doctorName: existingReport.doctor_name || '',
        reportDate: existingReport.report_date,
        date: existingReport.report_date,
        uploadedAt: existingReport.created_at ? existingReport.created_at.toISOString().split('T')[0] : existingReport.report_date,
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

    console.log(`[REPORT ENGINE DEBUG] Processing NEW uploaded report: "${file.originalname}" | Buffer Size: ${fileBuffer ? fileBuffer.length : 0} bytes | MIME: ${file.mimetype} for user ${user._id}`);

    const ocrResult = await ocrService.processReportFile(file);

    const newReport = await Report.create({
      user_id: user._id,
      title: cleanTitle || "Uploaded Lab Report",
      patient_name: ocrResult.patientName || "Unspecified",
      lab_name: ocrResult.labName || "",
      doctor_name: ocrResult.doctorName || "",
      report_date: ocrResult.reportDate || ocrResult.date || new Date().toISOString().split('T')[0],
      file_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size || (fileBuffer ? fileBuffer.length : 0),
      file_hash: fileHash || '',
      ocr_confidence: ocrResult.ocrConfidence || "Extraction Unsuccessful",
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
      if (name && !seenNames.has(name.toLowerCase().trim())) {
        seenNames.add(name.toLowerCase().trim());
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
      patientName: newReport.patient_name,
      labName: newReport.lab_name,
      doctorName: newReport.doctor_name,
      reportDate: newReport.report_date,
      date: newReport.report_date,
      uploadedAt: newReport.created_at ? newReport.created_at.toISOString().split('T')[0] : newReport.report_date,
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

    console.log(`[REPORT ENGINE DEBUG] Saved Report ID ${newReport._id} to MongoDB with ${uniqueBiomarkers.length} biomarkers, ${ocrResult.vitals?.length || 0} vitals, ${ocrResult.extractedMedications?.length || 0} medications for patient "${newReport.patient_name}"`);

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

exports.deleteReport = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid report ID" });
    }

    const deleted = await Report.findOneAndDelete({ _id: id, user_id: user._id });
    if (!deleted) {
      return res.status(404).json({ error: "Report not found or access denied." });
    }

    await ReportValue.deleteMany({ report_id: id });
    await ReportSummary.deleteMany({ report_id: id });

    res.json({ success: true, message: "Report deleted successfully." });
  } catch (error) {
    next(error);
  }
};
