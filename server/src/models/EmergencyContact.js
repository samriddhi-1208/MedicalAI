const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.Mixed, ref: 'User', required: true },
    name: { type: String, required: true },
    relation: { type: String, default: 'Family' },
    phone: { type: String, required: true },
    email: { type: String },
    is_primary: { type: Number, default: 0 },
    notify_on_sos: { type: Number, default: 1 }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

emergencyContactSchema.virtual('id').get(function () {
  return this._id ? (this._id.toHexString ? this._id.toHexString() : String(this._id)) : '';
});

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
