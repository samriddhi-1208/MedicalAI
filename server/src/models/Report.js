const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    lab_name: { type: String, default: 'Diagnostic Pathology Center' },
    doctor_name: { type: String, default: 'Consulting Physician' },
    report_date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    file_name: { type: String },
    file_type: { type: String, default: 'application/pdf' },
    file_size: { type: Number, default: 0 },
    file_hash: { type: String, default: '' },
    ocr_confidence: { type: String, default: '98.9%' },
    status_flag: { type: String, default: 'Optimal' },
    vitals: { type: Array, default: [] },
    extracted_medications: { type: Array, default: [] },
    raw_text: { type: String, default: '' }
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

reportSchema.index({ user_id: 1, file_hash: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Report', reportSchema);
