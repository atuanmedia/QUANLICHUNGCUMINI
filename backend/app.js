const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Logging (chỉ bật khi ở chế độ development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===== ROUTES =====
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/apartments', require('./src/routes/apartmentRoutes'));
app.use('/api/residents', require('./src/routes/residentRoutes'));
app.use('/api/invoices', require('./src/routes/invoiceRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/announcements', require('./src/routes/announcementRoutes'));
app.use('/api/temp-residence', require('./src/routes/tempResidenceRoutes'));
// ===== Error Handling =====
app.use(notFound);
app.use(errorHandler);

module.exports = app;
