const mongoose = require('mongoose');

const medicineLogSchema = new mongoose.Schema(
  {
    medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    taken_at: { type: Date, default: Date.now },
    status: { type: String, default: 'Logged' }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

medicineLogSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('MedicineLog', medicineLogSchema);
