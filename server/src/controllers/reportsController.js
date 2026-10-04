const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const Report = require('../models/Report');
const ReportValue = require('../models/ReportValue');
const ReportSummary = require('../models/ReportSummary');
const ocrService = require('../services/ocrService');
const User = require('../models/User');

// Helper to safely format ID whether ObjectId or string
function toIdString(val) {
  if (!val) return '';
  return typeof val.toHexString === 'function' ? val.toHexString() : String(val);
}

const path = require('path');

// Persistent storage file for offline resilience
const REPORTS_FILE = path.join(__dirname, '../data/reports.json');
const allPersistentReports = [];
const inMemoryReports = new Map();

function loadPersistentReports() {
  try {
    if (fs.existsSync(REPORTS_FILE)) {
      const content = fs.readFileSync(REPORTS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        allPersistentReports.length = 0;
        data.forEach(r => allPersistentReports.push(r));
        console.log(`[REPORTS CONTROLLER] Loaded ${allPersistentReports.length} persistent report(s) from disk.`);
      }
    }
  } catch (err) {
    console.warn('[REPORTS CONTROLLER] Could not load persistent reports:', err.message);
  }
}

function savePersistentReports() {
  try {
    const dir = path.dirname(REPORTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(allPersistentReports, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[REPORTS CONTROLLER] Could not save persistent reports:', err.message);
  }
}

loadPersistentReports();

function getReportsForUser(user) {
  const userId = String(user._id || user.id || '').trim();
  const userEmail = (user.email || '').toLowerCase().trim();

  return allPersistentReports.filter(r => {
    const rUid = String(r.user_id || r.userId || '').trim();
    const rEmail = (r.user_email || r.userEmail || '').toLowerCase().trim();
    if (userId && rUid && rUid === userId) return true;
    if (userEmail && rEmail && rEmail === userEmail) return true;
    return false;
  });
}

exports.__inMemoryReports = inMemoryReports;
exports.__allPersistentReports = allPersistentReports;
exports.getReportsForUser = getReportsForUser;

async function getUserFromReq(req) {
  const userId = req.user?.id;
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        const found = await User.findById(userId);
        if (found) return found;
      }
      if (req.user?.email) {
        const found = await User.findOne({ email: req.user.email.toLowerCase().trim() });
        if (found) return found;
      }
    } catch (e) {
      console.warn('[REPORTS] getUserFromReq DB note:', e.message);
    }
  }

  const authCtrl = require('./authController');
  const userEmail = (req.user?.email || '').toLowerCase().trim();
  if (userEmail && authCtrl.__inMemoryUsers?.has(userEmail)) {
    return {
      ...authCtrl.__inMemoryUsers.get(userEmail),
      toObject: function() { return { ...this }; }
    };
  }

  return {
    _id: userId || 'u-101',
    id: userId || 'u-101',
    full_name: req.user?.name || 'Patient',
    name: req.user?.name || 'Patient',
    email: req.user?.email || 'patient@medguardian.ai',
    toObject: function() { return { ...this }; }
  };
}

exports.getReports = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const reports = await Report.find({ user_id: user._id }).sort({ created_at: -1 });

        const populated = await Promise.all(
          reports.map(async (r) => {
            const values = await ReportValue.find({ report_id: r._id });
            const summaryObj = await ReportSummary.findOne({ report_id: r._id });

            const rObj = r.toObject();
            const mappedBiomarkers = values.map(v => ({
              id: toIdString(v._id),
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
              id: toIdString(r._id),
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

        if (populated.length > 0) {
          // Merge into persistent disk cache
          populated.forEach(p => {
            const idx = allPersistentReports.findIndex(r => String(r.id || r._id) === String(p.id || p._id));
            if (idx >= 0) allPersistentReports[idx] = p;
            else allPersistentReports.unshift(p);
          });
          savePersistentReports();
          return res.json(populated);
        }
      } catch (dbErr) {
        console.warn('[REPORTS] DB getReports fallback to disk cache:', dbErr.message);
      }
    }

    const diskReports = getReportsForUser(user);
    res.json(diskReports);
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

    if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(reportId)) {
      try {
        const report = await Report.findById(reportId);
        if (report) {
          if (report.user_id.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "Access denied. You do not own this report." });
          }

          const values = await ReportValue.find({ report_id: report._id });
          const summaryObj = await ReportSummary.findOne({ report_id: report._id });

          const mappedBiomarkers = values.map(v => ({
            id: toIdString(v._id),
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

          return res.json({
            id: toIdString(report._id),
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
        }
      } catch (dbErr) {
        console.warn('[REPORTS] DB getReportById fallback:', dbErr.message);
      }
    }

    const diskReports = getReportsForUser(user);
    const found = diskReports.find(r => String(r.id) === String(reportId) || String(r._id) === String(reportId));
    if (found) {
      return res.json(found);
    }

    res.status(404).json({ error: "Report not found." });
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
    if (fileHash && mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        existingReport = await Report.findOne({
          user_id: user._id,
          file_hash: fileHash
        });
      } catch (e) {
        console.warn('[REPORTS] DB duplicate check note:', e.message);
      }
    }

    // Check persistent disk cache for duplicate
    const cachedUserReports = getReportsForUser(user);
    if (!existingReport && fileHash) {
      existingReport = cachedUserReports.find(r => r.file_hash === fileHash);
    }

    if (existingReport) {
      console.log(`[REPORT ENGINE] Duplicate SHA-256 hash report detected for user ${user._id}: "${file.originalname}". Returning existing record.`);
      
      let populatedExisting = existingReport;
      if (mongoose.connection && mongoose.connection.readyState === 1 && existingReport._id && typeof existingReport.toObject === 'function') {
        try {
          const values = await ReportValue.find({ report_id: existingReport._id });
          const summaryObj = await ReportSummary.findOne({ report_id: existingReport._id });

          const mappedBiomarkers = values.map(v => ({
            id: toIdString(v._id),
            name: v.biomarker_name,
            testName: v.biomarker_name,
            value: isNaN(Number(v.value)) ? v.value : Number(v.value),
            unit: v.unit,
            refRange: v.reference_range,
            referenceRange: v.reference_range,
            status: v.status_flag,
            category: v.category
          }));

          populatedExisting = {
            id: toIdString(existingReport._id),
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
        } catch (_) {}
      }

      return res.status(200).json({ 
        report: populatedExisting, 
        isDuplicate: true, 
        duplicate: true,
        existingReportId: existingReport.id || (existingReport._id ? String(existingReport._id) : null),
        message: "This medical report has already been uploaded." 
      });
    }

    console.log(`[REPORT ENGINE DEBUG] Processing NEW uploaded report: "${file.originalname}" | Buffer Size: ${fileBuffer ? fileBuffer.length : 0} bytes | MIME: ${file.mimetype} for user ${user._id}`);

    const ocrResult = await ocrService.processReportFile(file);

    // CRITICAL VALIDATION: Verify meaningful medical data extracted before saving
    const bCount = (Array.isArray(ocrResult.biomarkers) ? ocrResult.biomarkers.length : 0) +
                   (Array.isArray(ocrResult.labResults) ? ocrResult.labResults.length : 0);
    const vCount = Array.isArray(ocrResult.vitals) ? ocrResult.vitals.length : 0;
    const mCount = Array.isArray(ocrResult.extractedMedications) ? ocrResult.extractedMedications.length : 0;
    const totalExtracted = bCount + vCount + mCount;
    const hasValidSummary = Boolean(ocrResult.aiSummary && ocrResult.aiSummary.trim().length > 15 && !ocrResult.aiSummary.includes("Unable to extract"));

    if (totalExtracted === 0 && !hasValidSummary) {
      console.log(`[REPORT ENGINE REJECTION] Medical extraction failed for "${file.originalname}". 0 parameters extracted.`);
      return res.status(422).json({
        error: "Medical report could not be processed.",
        message: "We couldn't extract reliable medical information from this document. The report was not saved. Please upload a clearer medical report.",
        saved: false,
        success: false
      });
    }

    const combinedBiomarkers = [
      ...(Array.isArray(ocrResult.biomarkers) ? ocrResult.biomarkers : []),
      ...(Array.isArray(ocrResult.labResults) ? ocrResult.labResults : [])
    ];

    const uniqueBiomarkers = [];
    const seenNames = new Set();

    combinedBiomarkers.forEach(bm => {
      const name = bm.name || bm.testName;
      if (name && !seenNames.has(name.toLowerCase().trim())) {
        seenNames.add(name.toLowerCase().trim());
        uniqueBiomarkers.push(bm);
      }
    });

    let savedReportId = new mongoose.Types.ObjectId().toHexString();

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
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
          ocr_confidence: ocrResult.ocrConfidence || "Optimal",
          status_flag: ocrResult.status || "Optimal",
          vitals: Array.isArray(ocrResult.vitals) ? ocrResult.vitals : [],
          extracted_medications: Array.isArray(ocrResult.extractedMedications) ? ocrResult.extractedMedications : [],
          raw_text: ocrResult.rawText || ''
        });

        savedReportId = toIdString(newReport._id);

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
      } catch (dbErr) {
        console.warn('[REPORTS] DB write note (using memory cache):', dbErr.message);
      }
    }

    const populatedReport = {
      id: savedReportId,
      _id: savedReportId,
      user_id: user._id,
      title: cleanTitle || "Uploaded Lab Report",
      patientName: ocrResult.patientName || user.full_name || user.name || "Patient",
      labName: ocrResult.labName || "",
      doctorName: ocrResult.doctorName || "",
      reportDate: ocrResult.reportDate || ocrResult.date || new Date().toISOString().split('T')[0],
      date: ocrResult.reportDate || ocrResult.date || new Date().toISOString().split('T')[0],
      uploadedAt: new Date().toISOString().split('T')[0],
      file_name: file.originalname,
      file_type: file.mimetype,
      file_size: file.size || (fileBuffer ? fileBuffer.length : 0),
      file_hash: fileHash || '',
      ocrConfidence: ocrResult.ocrConfidence || "Optimal",
      status: ocrResult.status || "Optimal",
      statusType: ocrResult.statusType || 'normal',
      biomarkers: uniqueBiomarkers,
      labResults: uniqueBiomarkers,
      vitals: ocrResult.vitals || [],
      extractedMedications: ocrResult.extractedMedications || [],
      medications: ocrResult.extractedMedications || [],
      rawText: ocrResult.rawText || '',
      aiSummary: ocrResult.aiSummary || "Clinical analysis completed.",
      keyFindings: ocrResult.keyFindings || [],
      recommendations: ocrResult.recommendations || { lifestyle: [], medical: [] }
    };

    populatedReport.user_id = String(user._id || user.id);
    populatedReport.user_email = (user.email || '').toLowerCase().trim();

    // Store in persistent reports array & save to disk
    const existingIdx = allPersistentReports.findIndex(r => String(r.id || r._id) === String(populatedReport.id || populatedReport._id));
    if (existingIdx >= 0) {
      allPersistentReports[existingIdx] = populatedReport;
    } else {
      allPersistentReports.unshift(populatedReport);
    }
    savePersistentReports();

    // Store in in-memory store
    const uKey = String(user._id);
    if (!inMemoryReports.has(uKey)) {
      inMemoryReports.set(uKey, []);
    }
    inMemoryReports.get(uKey).unshift(populatedReport);

    // Directly add identified prescription medications to user's daily medication schedule
    const allExtractedMeds = Array.isArray(ocrResult.extractedMedications) ? ocrResult.extractedMedications : (Array.isArray(ocrResult.medications) ? ocrResult.medications : []);
    if (allExtractedMeds.length > 0) {
      try {
        const medCtrl = require('./medicinesController');
        for (const m of allExtractedMeds) {
          const medName = (m.medicineName || m.name || '').trim();
          if (medName) {
            await medCtrl.autoScheduleExtractedMedication(user, {
              name: medName,
              dose: m.dose || m.strength || '1 tablet',
              frequency: m.frequency || 'Once daily',
              scheduled_time: m.timing || '08:00 AM',
              time: m.timing || '08:00 AM',
              meal_relation: m.mealRelation || 'After meal',
              meal_type: m.mealType || 'Lunch',
              delay_minutes: Number(m.delayMinutes || 30),
              duration_days: parseInt(m.durationDays || m.duration || 5) || 5,
              source_title: cleanTitle || file.originalname || 'Uploaded Lab Report',
              report_id: savedReportId,
              purpose: m.genericName ? `Prescribed: ${m.genericName}` : 'Prescribed Medication',
              instructions: m.specialInstructions || ''
            });
          }
        }
        console.log(`[REPORT ENGINE] Directly scheduled ${allExtractedMeds.length} identified medication(s) for user ${user._id}`);
      } catch (autoMedErr) {
        console.warn('[REPORTS] Auto-schedule medication error:', autoMedErr.message);
      }
    }

    console.log(`[REPORT ENGINE DEBUG] Successfully processed report ${savedReportId} with ${uniqueBiomarkers.length} biomarkers, ${ocrResult.vitals?.length || 0} vitals, ${ocrResult.extractedMedications?.length || 0} medications`);

    res.status(201).json({ report: populatedReport, isDuplicate: false, duplicate: false });
  } catch (error) {
    console.error("[REPORTS] uploadReport error:", error);
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

    if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await Report.findOneAndDelete({ _id: id, user_id: user._id });
        await ReportValue.deleteMany({ report_id: id });
        await ReportSummary.deleteMany({ report_id: id });
      } catch (dbErr) {
        console.warn('[REPORTS] DB deleteReport note:', dbErr.message);
      }
    }

    const uKey = String(user._id);
    if (inMemoryReports.has(uKey)) {
      const filtered = inMemoryReports.get(uKey).filter(r => String(r.id) !== String(id) && String(r._id) !== String(id));
      inMemoryReports.set(uKey, filtered);
    }

    const delIdx = allPersistentReports.findIndex(r => 
      (String(r.id) === String(id) || String(r._id) === String(id)) &&
      (String(r.user_id) === String(user._id) || (user.email && r.user_email === user.email.toLowerCase()))
    );
    if (delIdx >= 0) {
      allPersistentReports.splice(delIdx, 1);
      savePersistentReports();
    }

    res.json({ success: true, message: "Report deleted successfully." });
  } catch (error) {
    next(error);
  }
};
