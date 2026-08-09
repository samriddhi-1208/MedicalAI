const mongoose = require('mongoose');

const sosEventSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trigger_type: { type: String, default: 'Manual SOS Button' },
    latitude: { type: Number, default: 28.6139 },
    longitude: { type: Number, default: 77.2090 },
    status: { type: String, default: 'DISPATCHED' },
    notes: { type: String, default: 'Manual Emergency SOS Dispatch' }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

sosEventSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('SOSEvent', sosEventSchema);
