const express = require('express');
const router = express.Router();
const authenticate = require('../Middleware/authMiddleware');
const { canWritePatientRecords } = require('../Middleware/rbacMiddleware');
const Notification = require('../Model/notification');

// All notification routes require authentication

// Get all notifications - all authenticated staff can view
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read - all authenticated staff can mark as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new notification - only medical staff can create notifications
router.post('/', authenticate, canWritePatientRecords, async (req, res) => {
  try {
    const { message, type } = req.body;
    
    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    
    const notification = new Notification({ message, type, read: false });
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
