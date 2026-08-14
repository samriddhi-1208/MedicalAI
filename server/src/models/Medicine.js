const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    report_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
    name: { type: String, required: true },
    dose: { type: String, default: '1 tablet' },
    dosage: { type: String, default: '1 tablet' },
    frequency: { type: String, default: 'Once daily' }, // 'Once daily', 'Twice daily', 'Three times daily', 'Custom'
    scheduled_time: { type: String, default: '08:00 AM' }, // e.g. '08:00 AM'
    time_slot: { type: String, default: 'Morning' },
    meal_relation: { type: String, default: 'After meal' }, // 'Before meal', 'With meal', 'After meal', 'No meal relation'
    meal_type: { type: String, default: 'Lunch' }, // 'Breakfast', 'Lunch', 'Dinner'
    delay_minutes: { type: Number, default: 30 },
    duration_days: { type: Number, default: null },
    start_date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    end_date: { type: String, default: null },
    instructions: { type: String, default: '' },
    purpose: { type: String, default: 'Prescribed Medication' },
    total_pills: { type: Number, default: 30 },
    pills_remaining: { type: Number, default: 30 },
    is_paused: { type: Boolean, default: false },
    is_taken: { type: Boolean, default: false },
    last_taken_at: { type: Date, default: null }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

medicineSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Medicine', medicineSchema);
