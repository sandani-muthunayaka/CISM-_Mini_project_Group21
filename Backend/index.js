const express=require('express')
const connectDB = require('./Services/Connection')
const routes = require('./Routes/Routes');
const notificationRoutes = require('./Routes/notifications');
const reportRoutes = require('./Routes/reportRoutes');
const forgotPasswordRouter = require('./Routes/forgotPassword');
const sessionRoutes = require('./Routes/sessionRoutes');
const opdRecordRoutes = require('./Routes/opdRecordsRoutes');
const hospitalizationRecordRoutes = require('./Routes/hospitalizationRecordsRoutes');
const medicationRecordRoutes = require('./Routes/medicationRecordsRoutes');
const staffRoutes = require('./Routes/staffRoutes');
const app=express()
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.use('/', routes);
app.use('/notifications', notificationRoutes);
app.use('/reports', reportRoutes);
app.use('/forgot-password', forgotPasswordRouter);
app.use('/session', sessionRoutes);
app.use('/opd-records', opdRecordRoutes);
app.use('/staff', staffRoutes);
app.use('/hospitalization-records', hospitalizationRecordRoutes);
app.use('/medication-records', medicationRecordRoutes)

connectDB()

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})