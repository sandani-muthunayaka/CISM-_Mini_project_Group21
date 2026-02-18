const express=require('express')
const connectDB = require('./Services/Connection')
const routes = require('./Routes/Routes');
const notificationRoutes = require('./Routes/notifications');
const reportRoutes = require('./Routes/reportRoutes');
const forgotPasswordRouter = require('./Routes/forgotPassword');
const sessionRoutes = require('./Routes/sessionRoutes');
const mongoSanitize = require('express-mongo-sanitize');
const app=express()
const cors = require('cors');

// Body parser middleware - support both JSON and form-data
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cors());

// ============================================
// NoSQL INJECTION PREVENTION
// ============================================
// express-mongo-sanitize: Removes MongoDB operators from user input
// Prevents attacks like: {"username": {"$ne": null}}
app.use(mongoSanitize({
  replaceWith: '_',  // Replace $ with _ to neutralize operators
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] NoSQL injection attempt detected and blocked`);
    console.warn(`[SECURITY] Suspicious key: ${key}, IP: ${req.ip}`);
  }
}));

// Additional validation: Block requests with object values in body
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      const value = req.body[key];
      // If value is an object (but not null, not array, not date), it's suspicious
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        console.warn(`[SECURITY] Suspicious object value detected in field: ${key}`);
        console.warn(`[SECURITY] Request from IP: ${req.ip}`);
        return res.status(400).json({
          message: 'Invalid request format',
          error: 'VALIDATION_ERROR',
          detail: `Field "${key}" contains invalid data type`
        });
      }
    }
  }
  next();
});

app.use('/', routes);
app.use('/notifications', notificationRoutes);
app.use('/reports', reportRoutes);
app.use('/forgot-password', forgotPasswordRouter);
app.use('/session', sessionRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

connectDB()

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})