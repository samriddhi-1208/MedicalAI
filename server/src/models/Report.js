const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    lab_name: { type: String, default: 'Apex Clinical Laboratories' },
    doctor_name: { type: String, default: 'Dr. Aris Thorne' },
    report_date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    file_name: { type: String },
    file_type: { type: String, default: 'application/pdf' },
    ocr_confidence: { type: String, default: '98.9%' },
    status_flag: { type: String, default: 'Attention Needed' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reportSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Report', reportSchema);
