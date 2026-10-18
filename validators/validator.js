const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Input validation failed', { errors: errors.array(), path: req.originalUrl });
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateSignup = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateResult
];

const validateLogin = [
  body('password')
    .notEmpty().withMessage('Password is required'),
  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.email) {
      throw new Error('Either username or email must be provided for login');
    }
    return true;
  }),
  validateResult
];

const validateEmployee = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required'),
  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid employee email address'),
  body('position')
    .trim()
    .notEmpty().withMessage('Position is required'),
  body('salary')
    .notEmpty().withMessage('Salary is required')
    .isNumeric().withMessage('Salary must be a numeric value')
    .custom((value) => value >= 0).withMessage('Salary cannot be negative'),
  body('date_of_joining')
    .notEmpty().withMessage('Date of joining is required')
    .isISO8601().withMessage('Date of joining must be a valid date format (YYYY-MM-DD)')
    .toDate(),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  validateResult
];

module.exports = {
  validateSignup,
  validateLogin,
  validateEmployee
};