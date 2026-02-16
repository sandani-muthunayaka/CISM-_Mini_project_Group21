/**
 * Server-Side Validation Middleware
 * Never rely on client-side controls - validate everything on the server
 */

/**
 * Validate patient ID parameter
 */
const validatePatientId = (req, res, next) => {
  const { patientId } = req.params;
  
  if (!patientId) {
    return res.status(400).json({ 
      message: 'Patient ID is required.',
      error: 'VALIDATION_ERROR' 
    });
  }

  // Check if it's a valid format (adjust based on your patient ID format)
  if (typeof patientId !== 'string' || patientId.trim().length === 0) {
    return res.status(400).json({ 
      message: 'Invalid patient ID format.',
      error: 'VALIDATION_ERROR' 
    });
  }

  next();
};

/**
 * Validate medication record data
 */
const validateMedicationData = (req, res, next) => {
  const { medication, dosage } = req.body;
  
  const errors = [];
  
  if (!medication || typeof medication !== 'string' || medication.trim().length === 0) {
    errors.push('Medication name is required and must be a valid string.');
  }
  
  if (!dosage || typeof dosage !== 'string' || dosage.trim().length === 0) {
    errors.push('Dosage is required and must be a valid string.');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed.',
      error: 'VALIDATION_ERROR',
      details: errors 
    });
  }
  
  // Sanitize data
  req.body.medication = medication.trim();
  req.body.dosage = dosage.trim();
  if (req.body.comments) {
    req.body.comments = req.body.comments.trim();
  }
  
  next();
};

/**
 * Validate hospitalization record data
 */
const validateHospitalizationData = (req, res, next) => {
  const { ward, diagnosis, date } = req.body;
  
  const errors = [];
  
  if (!ward || typeof ward !== 'string' || ward.trim().length === 0) {
    errors.push('Hospital/Ward name is required and must be a valid string.');
  }
  
  if (!diagnosis || typeof diagnosis !== 'string' || diagnosis.trim().length === 0) {
    errors.push('Diagnosis is required and must be a valid string.');
  }
  
  if (date && isNaN(Date.parse(date))) {
    errors.push('Invalid date format.');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed.',
      error: 'VALIDATION_ERROR',
      details: errors 
    });
  }
  
  // Sanitize data
  req.body.ward = ward.trim();
  req.body.diagnosis = diagnosis.trim();
  if (req.body.followUp) {
    req.body.followUp = req.body.followUp.trim();
  }
  
  next();
};

/**
 * Validate OPD record data
 */
const validateOPDData = (req, res, next) => {
  const { symptoms, treatment, date } = req.body;
  
  const errors = [];
  
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
    errors.push('Symptoms are required and must be a valid string.');
  }
  
  if (!treatment || typeof treatment !== 'string' || treatment.trim().length === 0) {
    errors.push('Treatment is required and must be a valid string.');
  }
  
  if (date && isNaN(Date.parse(date))) {
    errors.push('Invalid date format.');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed.',
      error: 'VALIDATION_ERROR',
      details: errors 
    });
  }
  
  // Sanitize data
  req.body.symptoms = symptoms.trim();
  req.body.treatment = treatment.trim();
  if (req.body.investigation) {
    req.body.investigation = req.body.investigation.trim();
  }
  
  next();
};

/**
 * Validate patient save data
 * Handles tab-based patient data structure
 */
const validatePatientData = (req, res, next) => {
  const { patientId, tabs } = req.body;
  
  const errors = [];
  
  if (!patientId || typeof patientId !== 'string' || patientId.trim().length === 0) {
    errors.push('Patient ID is required and must be a valid string.');
  }
  
  if (!tabs || typeof tabs !== 'object') {
    errors.push('Patient data (tabs) is required and must be an object.');
  }
  
  // If tab1 exists AND has a name field (initial registration or update), validate required fields
  if (tabs && tabs.tab1 && tabs.tab1.name !== undefined) {
    const { name, nic } = tabs.tab1;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Patient name is required in tab1 and must be a valid string.');
    }
    
    // NIC validation is optional but if provided should be valid
    if (nic && (typeof nic !== 'string' || nic.trim().length === 0)) {
      errors.push('If provided, NIC must be a valid string.');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed.',
      error: 'VALIDATION_ERROR',
      details: errors 
    });
  }
  
  next();
};

/**
 * Validate staff registration data
 */
const validateStaffData = (req, res, next) => {
  const { username, employee_number, position, password } = req.body;
  
  const errors = [];
  
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    errors.push('Username is required and must be at least 3 characters.');
  }
  
  if (!employee_number || typeof employee_number !== 'string' || employee_number.trim().length === 0) {
    errors.push('Employee number is required.');
  }
  
  if (!position || typeof position !== 'string' || position.trim().length === 0) {
    errors.push('Position is required.');
  }
  
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters.');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed.',
      error: 'VALIDATION_ERROR',
      details: errors 
    });
  }
  
  next();
};

/**
 * Sanitize input to prevent injection attacks
 */
const sanitizeInput = (req, res, next) => {
  // Recursive function to sanitize all string values in an object
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove potential malicious characters
      return obj.replace(/[<>]/g, '');
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  
  next();
};

/**
 * Rate limiting helper - prevent abuse
 */
const createRateLimiter = () => {
  const requests = new Map();
  const WINDOW_MS = 60000; // 1 minute
  const MAX_REQUESTS = 100; // Max requests per window

  return (req, res, next) => {
    const identifier = req.user ? req.user.id : req.ip;
    const now = Date.now();
    
    if (!requests.has(identifier)) {
      requests.set(identifier, []);
    }
    
    const userRequests = requests.get(identifier);
    const recentRequests = userRequests.filter(time => now - time < WINDOW_MS);
    
    if (recentRequests.length >= MAX_REQUESTS) {
      return res.status(429).json({ 
        message: 'Too many requests. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED' 
      });
    }
    
    recentRequests.push(now);
    requests.set(identifier, recentRequests);
    
    next();
  };
};

module.exports = {
  validatePatientId,
  validateMedicationData,
  validateHospitalizationData,
  validateOPDData,
  validatePatientData,
  validateStaffData,
  sanitizeInput,
  createRateLimiter
};
