require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const logger = require('./config/logger');
const requestLogger = require('./middleware/logger.middleware');

const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(helmet());
    
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: 'Too many API requests from this IP, please try again later.'
  }
});

app.use('/api/v1/user/signup', authLimiter);
app.use('/api/v1/user/login', authLimiter);
app.use('/api/v1/', apiLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'Server is up and running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/v1/user', authRoutes);
app.use('/api/v1/emp', employeeRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    status: false,
    message: 'Endpoint not found.'
  });
});

app.use((err, req, res, next) => {
  logger.error(`Unexpected server error: ${err.message}`, { stack: err.stack });
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
});