const express = require('express');
const router = express.Router();
const authenticate = require('../Middleware/authMiddleware');
const { canViewPatientRecords } = require('../Middleware/rbacMiddleware');
const generateStaffReport = require('../Functions/generateStaffReport');
const generateBookReport = require('../Functions/generateBookReport');
const generatePatientReport = require('../Functions/generatePatientReport');
const generateSummaryReport = require('../Functions/generateSummaryReport');

// All report routes require authentication
// PDF download endpoint for staff report - require authentication
router.get('/staff/download', authenticate, async (req, res) => {
	try {
		await generateStaffReport(res, req.query);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// PDF download endpoint for book report - require authentication
router.get('/book/download', authenticate, async (req, res) => {
	try {
		await generateBookReport(res, req.query);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// PDF download endpoint for patient report - require authentication and view permission
router.get('/patient/download', authenticate, canViewPatientRecords, async (req, res) => {
	try {
		await generatePatientReport(res, req.query);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// PDF download endpoint for summary report - require authentication
router.get('/summary/download', authenticate, async (req, res) => {
	try {
		await generateSummaryReport(res, req.query);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
