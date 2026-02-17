const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['duplicate', 'lost_book'], required: true },
  message: { type: String, required: true },
  patientId: { type: String },
  staffId: { type: String },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema, 'notifications');
