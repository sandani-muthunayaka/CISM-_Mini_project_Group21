const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  username: { type: String, required: true },
  employee_number: { type: String, required: true, unique: true },
  position: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  passwordResetAt: { type: Date },
  isPasswordTemporary: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  lastActivityAt: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  accountLockedUntil: { type: Date, default: null }
}, {
  strict: true,        // Reject fields not in schema (NoSQL injection prevention)
  strictQuery: true    // Apply strict mode to query filters
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Staff || mongoose.model('Staff', staffSchema, 'staffs');