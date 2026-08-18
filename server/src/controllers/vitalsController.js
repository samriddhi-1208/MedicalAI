const mongoose = require('mongoose');
const User = require('../models/User');
const Report = require('../models/Report');
const ReportValue = require('../models/ReportValue');

async function getUserFromReq(req) {
  const userId = req.user?.id;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    return await User.findById(userId);
  }
  if (req.user?.email) {
    return await User.findOne({ email: req.user.email.toLowerCase().trim() });
  }
  return null;
}

exports.getBiomarkerHistories = async (req, res, next) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) {
      return res.json({});
    }

    // Query authenticated user's reports chronologically
    const userReports = await Report.find({ user_id: user._id }).sort({ created_at: 1 });
    if (userReports.length === 0) {
      return res.json({});
    }

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

      const report = reportMap[val.report_id.toString()];
      const dateStr = report ? (report.report_date || report.created_at?.toISOString().split('T')[0]) : 'Previous';
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
          reportId: report ? report._id.toString() : null
        });
      }
    });

    res.json(histories);
  } catch (error) {
    next(error);
  }
};
