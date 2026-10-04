const mongoose = require('mongoose');
const User = require('../models/User');
const Report = require('../models/Report');
const ReportValue = require('../models/ReportValue');

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
      console.warn('[VITALS] getUserFromReq DB note:', e.message);
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

  return null;
}

exports.getBiomarkerHistories = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.json({});
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        // Query authenticated user's reports chronologically
        const userReports = await Report.find({ user_id: user._id }).sort({ created_at: 1 });
        if (userReports.length > 0) {
          const reportIds = userReports.map(r => r._id);
          const reportMap = {};
          userReports.forEach(r => {
            reportMap[r._id.toString()] = r;
          });

          const values = await ReportValue.find({ report_id: { $in: reportIds } });
          const histories = {};

          values.forEach(val => {
            const name = val.biomarker_name;
            if (!name) return;

            const report = reportMap[val.report_id ? val.report_id.toString() : ''];
            const dateStr = report ? (report.report_date || (report.created_at ? report.created_at.toISOString().split('T')[0] : 'Previous')) : 'Previous';
            const numericVal = parseFloat(val.value);

            if (!isNaN(numericVal)) {
              if (!histories[name]) {
                histories[name] = [];
              }
              histories[name].push({
                date: dateStr,
                value: numericVal,
                unit: val.unit || '',
                reportTitle: report ? report.title : 'Lab Report',
                reportId: report ? (report._id ? report._id.toString() : null) : null
              });
            }
          });

          return res.json(histories);
        }
      } catch (dbErr) {
        console.warn('[VITALS] getBiomarkerHistories DB note:', dbErr.message);
      }
    }

    // Offline / fallback from in-memory reports
    const reportsCtrl = require('./reportsController');
    const uKey = String(user._id);
    const cachedReports = typeof reportsCtrl.getReportsForUser === 'function'
      ? reportsCtrl.getReportsForUser(user)
      : (reportsCtrl.__inMemoryReports?.get(uKey) || reportsCtrl.__inMemoryReports?.get(String(user.email)) || []);
    const histories = {};

    cachedReports.forEach(report => {
      const dateStr = report.reportDate || report.date || 'Previous';
      const bms = report.biomarkers || report.labResults || [];
      bms.forEach(bm => {
        const name = bm.name || bm.testName;
        const numericVal = parseFloat(bm.value);
        if (name && !isNaN(numericVal)) {
          if (!histories[name]) histories[name] = [];
          histories[name].push({
            date: dateStr,
            value: numericVal,
            unit: bm.unit || '',
            reportTitle: report.title || 'Lab Report',
            reportId: report.id || null
          });
        }
      });
    });

    res.json(histories);
  } catch (error) {
    next(error);
  }
};
