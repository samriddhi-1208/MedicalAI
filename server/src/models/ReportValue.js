const mongoose = require('mongoose');

const reportValueSchema = new mongoose.Schema(
  {
    report_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
    biomarker_name: { type: String, required: true },
    value: { type: String, required: true },
    unit: { type: String, default: '' },
    reference_range: { type: String, default: '' },
    status_flag: { type: String, default: 'Normal' },
    category: { type: String, default: 'General' }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reportValueSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('ReportValue', reportValueSchema);
