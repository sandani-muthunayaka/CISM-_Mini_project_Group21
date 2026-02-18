const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const Staff = require('../Model/staff');
const { validatePasswordComplexity } = require('../Functions/passwordValidator');
const authenticate = require('../Middleware/authMiddleware');
const { requireAdmin } = require('../Middleware/rbacMiddleware');

// Simulate DB with a JSON file for demo
const REQUESTS_FILE = path.join(__dirname, '../Model/forgotPasswordRequests.json');

function readRequests() {
	if (!fs.existsSync(REQUESTS_FILE)) return [];
	return JSON.parse(fs.readFileSync(REQUESTS_FILE));
}
function writeRequests(requests) {
	fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));
}

// POST /forgot-password - PUBLIC (anyone can submit a password reset request)
router.post('/', async (req, res) => {
	try {
		const { username, employeeNumber, userType } = req.body;
		
		// Validate required fields
		if (!username || !employeeNumber) {
			return res.status(400).json({ 
				message: 'Username and employee number are required.' 
			});
		}

		// Validate user exists in database
		const staffMember = await Staff.findOne({ 
			username: username.trim(),
			employee_number: employeeNumber.trim()
		});

		if (!staffMember) {
			return res.status(404).json({ 
				message: 'Invalid username or employee number. Please verify your credentials.' 
			});
		}

		// Check if user type matches (if specified)
		if (userType === 'admin' && !staffMember.isAdmin && staffMember.position.toLowerCase() !== 'admin') {
			return res.status(403).json({ 
				message: 'Access denied. Admin credentials required.' 
			});
		}

		// Check for existing pending request
		const requests = readRequests();
		const existingRequest = requests.find(r => 
			r.username === username.trim() && r.status === 'pending'
		);

		if (existingRequest) {
			return res.status(409).json({ 
				message: 'You already have a pending password reset request. Please wait for admin approval.' 
			});
		}

		// Create new request
		const newRequest = {
			username: username.trim(),
			employeeNumber: employeeNumber.trim(),
			userType: userType || 'staff',
			position: staffMember.position,
			status: 'pending',
			requestedAt: new Date(),
			requestId: Date.now().toString() // Simple ID generation
		};

		requests.push(newRequest);
		writeRequests(requests);

		res.status(201).json({ 
			message: 'Password reset request submitted successfully. Please wait for admin approval.',
			requestId: newRequest.requestId
		});

	} catch (error) {
		console.error('Forgot password error:', error);
		res.status(500).json({ 
			message: 'Internal server error. Please try again later.' 
		});
	}
});

// GET /forgot-password - ADMIN ONLY (admin view)
router.get('/', authenticate, requireAdmin, (req, res) => {
	try {
		const requests = readRequests();
		// Sort by most recent first
		const sortedRequests = requests.sort((a, b) => 
			new Date(b.requestedAt) - new Date(a.requestedAt)
		);
		res.json(sortedRequests);
	} catch (error) {
		console.error('Error fetching password requests:', error);
		res.status(500).json({ 
			message: 'Error fetching password requests.' 
		});
	}
});

// PATCH /forgot-password/accept - ADMIN ONLY (admin accepts)
router.patch('/accept', authenticate, requireAdmin, async (req, res) => {
	try {
		const { username, newPassword } = req.body;
		
		if (!username) {
			return res.status(400).json({ 
				message: 'Username is required.' 
			});
		}

		let requests = readRequests();
		const requestIndex = requests.findIndex(r => 
			r.username === username && r.status === 'pending'
		);

		if (requestIndex === -1) {
			return res.status(404).json({ 
				message: 'No pending request found for this username.' 
			});
		}

		// Generate temporary password if not provided, otherwise validate
		let tempPassword;
		if (newPassword) {
			// Validate provided password complexity
			const passwordValidation = validatePasswordComplexity(newPassword);
			if (!passwordValidation.isValid) {
				return res.status(400).json({ 
					message: 'Password must contain at least 12 characters including uppercase, lowercase, number and special character.'
				});
			}
			tempPassword = newPassword;
		} else {
			tempPassword = generateTempPassword();
		}
		
		// Hash the new password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

		// Update user's password in database
		const updateResult = await Staff.findOneAndUpdate(
			{ username: username },
			{ 
				password: hashedPassword,
				passwordResetAt: new Date(),
				isPasswordTemporary: true,
				failedLoginAttempts: 0,
				accountLockedUntil: null
			},
			{ new: true }
		);

		if (!updateResult) {
			return res.status(404).json({ 
				message: 'User not found in database.' 
			});
		}


		res.json({ 
			message: 'Password reset request accepted successfully.',
			username: username,
			tempPassword: tempPassword,
			instruction: 'User should login with this temporary password and change it immediately.'
		});

	} catch (error) {
		console.error('Error accepting password request:', error);
		res.status(500).json({ 
			message: 'Error processing request acceptance.' 
		});
	}
});

// PATCH /forgot-password/reject - ADMIN ONLY (admin rejects)
router.patch('/reject', authenticate, requireAdmin, (req, res) => {
	try {
		const { username, reason } = req.body;
		
		if (!username) {
			return res.status(400).json({ 
				message: 'Username is required.' 
			});
		}

		let requests = readRequests();
		const requestIndex = requests.findIndex(r => 
			r.username === username && r.status === 'pending'
		);

		if (requestIndex === -1) {
			return res.status(404).json({ 
				message: 'No pending request found for this username.' 
			});
		}

		// Update request status
		requests[requestIndex] = {
			...requests[requestIndex],
			status: 'rejected',
			rejectedAt: new Date(),
			rejectionReason: reason || 'No reason provided'
		};

		writeRequests(requests);
		res.json({ 
			message: 'Password reset request rejected.',
			username: username
		});

	} catch (error) {
		console.error('Error rejecting password request:', error);
		res.status(500).json({ 
			message: 'Error processing request rejection.' 
		});
	}
});

// GET /forgot-password/status/:username - PUBLIC (check request status)
router.get('/status/:username', (req, res) => {
	try {
		const { username } = req.params;
		
		if (!username) {
			return res.status(400).json({ 
				message: 'Username is required.' 
			});
		}

		const requests = readRequests();
		const userRequests = requests
			.filter(r => r.username === username)
			.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

		if (userRequests.length === 0) {
			return res.status(404).json({ 
				message: 'No password reset requests found for this username.' 
			});
		}

		res.json({
			requests: userRequests,
			latestRequest: userRequests[0]
		});

	} catch (error) {
		console.error('Error checking request status:', error);
		res.status(500).json({ 
			message: 'Error checking request status.' 
		});
	}
});

// PATCH /forgot-password/change-password - PUBLIC (user changes temporary password)
router.patch('/change-password', async (req, res) => {
	try {
		const { username, currentPassword, newPassword } = req.body;
		
		if (!username || !currentPassword || !newPassword) {
			return res.status(400).json({ 
				message: 'Username, current password, and new password are required.' 
			});
		}

		// Validate new password complexity
		const passwordValidation = validatePasswordComplexity(newPassword);
		if (!passwordValidation.isValid) {
			return res.status(400).json({ 
				message: 'Password must contain at least 12 characters including uppercase, lowercase, number and special character.'
			});}
		

		// Find user and verify current password
		const user = await Staff.findOne({ username: username });
		if (!user) {
			return res.status(404).json({ 
				message: 'User not found.' 
			});
		}

		// Verify current password
		const passwordMatch = await bcrypt.compare(currentPassword, user.password);
		if (!passwordMatch) {
			return res.status(401).json({ 
				message: 'Current password is incorrect.' 
			});
		}

		// Hash new password
		const saltRounds = 10;
		const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

		// Update password in database
		await Staff.findOneAndUpdate(
			{ username: username },
			{ 
				password: hashedNewPassword,
				isPasswordTemporary: false,
				passwordResetAt: new Date(),
				lastLoginAt: new Date(),
				failedLoginAttempts: 0,
				accountLockedUntil: null
			}
		);

		res.json({ 
			message: 'Password changed successfully. You can now login with your new password.',
			passwordChanged: true
		});

	} catch (error) {
		console.error('Error changing password:', error);
		res.status(500).json({ 
			message: 'Error changing password. Please try again.' 
		});
	}
});

// Helper function to generate temporary password
function generateTempPassword() {
	const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
	const length = 8;
	let tempPassword = '';
	
	for (let i = 0; i < length; i++) {
		tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	
	return 'Temp' + tempPassword; // Prefix to indicate it's temporary
}

module.exports = router;
