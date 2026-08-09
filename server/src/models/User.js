const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, default: '$2a$10$w8T0F.82yB/wR3s8dG2u0eK0W.m9cR5H3uJ4kL.b1V2N3M4P5Q6R7' },
    full_name: { type: String, required: true, default: 'Patient' },
    phone: { type: String, default: '' },
    birth_date: { type: String, default: '' },
    age: { type: Number, default: 20 },
    gender: { type: String, default: 'Female' },
    blood_group: { type: String, default: 'O+' },
    height: { type: String, default: '' },
    weight: { type: String, default: '' },
    primary_physician: { type: String, default: '' }
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
