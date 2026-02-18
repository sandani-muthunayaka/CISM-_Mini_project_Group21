/**
 * NoSQL Injection Prevention Middleware
 * Implements multiple layers of protection against MongoDB injection attacks
 * 
 * Security Controls Implemented:
 * 1. MongoDB Operator Detection and Blocking
 * 2. Input Type Validation (prevents object injection)
 * 3. Input Sanitization (strips dangerous operators)
 */

// List of MongoDB operators that attackers commonly use for injection
const MONGO_OPERATORS = [
  '$where', '$ne', '$gt', '$gte', '$lt', '$lte',
  '$in', '$nin', '$regex', '$exists', '$type',
  '$expr', '$jsonSchema', '$mod', '$text', '$search',
  '$elemMatch', '$size', '$all', '$near', '$geoWithin'
];

/**
 * Recursively detect MongoDB operators in an object
 * @param {*} obj - The object to scan
 * @param {string} path - Current path in the object (for error reporting)
 * @returns {string|null} - Error message if operator found, null otherwise
 */
const detectMongoOperators = (obj, path = 'root') => {
  // Only scan objects, not primitives
  if (typeof obj !== 'object' || obj === null) {
    return null;
  }

  // Scan arrays recursively
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const threat = detectMongoOperators(obj[i], `${path}[${i}]`);
      if (threat) return threat;
    }
    return null;
  }

  // Scan object properties
  for (const key in obj) {
    // Check if key is a MongoDB operator
    if (key.startsWith('$')) {
      return `MongoDB operator detected: "${key}" at path: ${path}`;
    }
    
    if (MONGO_OPERATORS.includes(key)) {
      return `Dangerous MongoDB operator detected: "${key}" at path: ${path}`;
    }

    // Recursively check nested objects
    const threat = detectMongoOperators(obj[key], `${path}.${key}`);
    if (threat) return threat;
  }

  return null;
};

/**
 * Main middleware to block requests containing MongoDB operators
 * This provides defense-in-depth by scanning all input sources
 */
const blockMongoOperators = (req, res, next) => {
  try {
    // Check request body for operators
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyThreat = detectMongoOperators(req.body, 'body');
      if (bodyThreat) {
        console.warn(`[SECURITY] NoSQL injection attempt blocked: ${bodyThreat}`);
        console.warn(`[SECURITY] Request from IP: ${req.ip}, User: ${req.user?.username || 'anonymous'}`);
        
        return res.status(400).json({
          message: 'Invalid request format detected',
          error: 'SECURITY_VIOLATION',
          detail: 'Request contains disallowed operators'
        });
      }
    }

    // Check query parameters for operators
    if (req.query && Object.keys(req.query).length > 0) {
      const queryThreat = detectMongoOperators(req.query, 'query');
      if (queryThreat) {
        console.warn(`[SECURITY] NoSQL injection attempt in query params: ${queryThreat}`);
        console.warn(`[SECURITY] Request from IP: ${req.ip}, User: ${req.user?.username || 'anonymous'}`);
        
        return res.status(400).json({
          message: 'Invalid query parameter format',
          error: 'SECURITY_VIOLATION',
          detail: 'Query contains disallowed operators'
        });
      }
    }

    // Check URL parameters for operators (less common but possible)
    if (req.params && Object.keys(req.params).length > 0) {
      const paramsThreat = detectMongoOperators(req.params, 'params');
      if (paramsThreat) {
        console.warn(`[SECURITY] NoSQL injection attempt in URL params: ${paramsThreat}`);
        console.warn(`[SECURITY] Request from IP: ${req.ip}, User: ${req.user?.username || 'anonymous'}`);
        
        return res.status(400).json({
          message: 'Invalid URL parameter format',
          error: 'SECURITY_VIOLATION',
          detail: 'URL parameters contain disallowed operators'
        });
      }
    }

    next();
  } catch (error) {
    console.error('[SECURITY] Error in NoSQL injection detection middleware:', error);
    return res.status(500).json({
      message: 'Security validation error',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Validate that query parameters are primitive types, not objects
 * Prevents attacks like: /api/user?username[$ne]=admin
 * This would create: req.query.username = { "$ne": "admin" }
 */
const validateParamsArePrimitives = (req, res, next) => {
  try {
    // Check req.params (URL parameters like /user/:id)
    for (const key in req.params) {
      if (typeof req.params[key] === 'object' && req.params[key] !== null) {
        console.warn(`[SECURITY] Object injection attempt in URL params: ${key}`);
        console.warn(`[SECURITY] Request from IP: ${req.ip}, User: ${req.user?.username || 'anonymous'}`);
        
        return res.status(400).json({
          message: `Invalid parameter format: ${key} must be a primitive value`,
          error: 'VALIDATION_ERROR'
        });
      }
    }

    // Check req.query (query string parameters like ?search=value)
    for (const key in req.query) {
      if (typeof req.query[key] === 'object' && req.query[key] !== null && !Array.isArray(req.query[key])) {
        console.warn(`[SECURITY] Object injection attempt in query params: ${key}`);
        console.warn(`[SECURITY] Request from IP: ${req.ip}, User: ${req.user?.username || 'anonymous'}`);
        
        return res.status(400).json({
          message: `Invalid query parameter format: ${key} must be a primitive value`,
          error: 'VALIDATION_ERROR'
        });
      }
    }

    next();
  } catch (error) {
    console.error('[SECURITY] Error in parameter validation middleware:', error);
    return res.status(500).json({
      message: 'Parameter validation error',
      error: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Sanitize input by removing MongoDB operators
 * This is a fallback mechanism - use in addition to, not instead of, validation
 * @param {*} input - The input to sanitize
 * @returns {*} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }

  const sanitized = {};
  for (const key in input) {
    // Skip any keys that start with $ or are MongoDB operators
    if (key.startsWith('$') || MONGO_OPERATORS.includes(key)) {
      console.warn(`[SECURITY] Sanitized dangerous key: ${key}`);
      continue;
    }
    
    sanitized[key] = sanitizeInput(input[key]);
  }
  
  return sanitized;
};

/**
 * Validate critical authentication inputs
 * Ensures username and password are strings, not objects
 */
const validateAuthInputs = (req, res, next) => {
  const { username, password } = req.body;

  // Username validation
  if (!username || typeof username !== 'string') {
    return res.status(400).json({
      message: 'Invalid username format',
      error: 'VALIDATION_ERROR'
    });
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      message: 'Invalid password format',
      error: 'VALIDATION_ERROR'
    });
  }

  // Check for suspicious patterns in username
  if (username.includes('$') || username.includes('{') || username.includes('[')) {
    console.warn(`[SECURITY] Suspicious characters in username: ${username}`);
    return res.status(400).json({
      message: 'Invalid characters in username',
      error: 'VALIDATION_ERROR'
    });
  }

  next();
};

module.exports = {
  blockMongoOperators,
  validateParamsArePrimitives,
  sanitizeInput,
  validateAuthInputs,
  detectMongoOperators // Export for testing purposes
};
