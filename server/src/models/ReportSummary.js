const mongoose = require('mongoose');

const reportSummarySchema = new mongoose.Schema(
  {
    report_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
    plain_language_summary: { type: String, default: '' },
    key_findings: { type: [String], default: [] },
    lifestyle_advice: { type: [String], default: [] },
    clinical_advice: { type: [String], default: [] }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reportSummarySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('ReportSummary', reportSummarySchema);
