const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: { type: String, default: '500 mg' },
    frequency: { type: String, default: 'Once Daily' },
    time_slot: { type: String, default: 'Morning' },
    scheduled_time: { type: String, default: '08:00 AM' },
    purpose: { type: String, default: 'General Wellness' },
    total_pills: { type: Number, default: 30 },
    pills_remaining: { type: Number, default: 30 }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

medicineSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Medicine', medicineSchema);
