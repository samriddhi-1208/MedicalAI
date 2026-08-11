const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true, default: 'Patient' },
    phone: { type: String, default: '' },
    date_of_birth: { type: String, default: '' },
    age: { type: Number, default: 0 },
    gender: { type: String, default: 'Female' },
    height: { type: String, default: '' },
    height_unit: { type: String, default: 'cm' },
    weight: { type: String, default: '' },
    weight_unit: { type: String, default: 'kg' },
    blood_group: { type: String, default: 'Not Known' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    occupation: { type: String, default: '' },
    primary_physician: { type: String, default: '' },
    profile_completed: { type: Boolean, default: false }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('User', userSchema);
