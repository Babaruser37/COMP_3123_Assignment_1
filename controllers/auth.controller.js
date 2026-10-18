const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger.js');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      logger.warn(`Signup conflict: User already exists with email or username`, { email, username });
      return res.status(409).json({
        status: false,
        message: 'User already exists with this email or username.'
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    logger.info(`User registered successfully: ${username}`);

    return res.status(201).json({
      status: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at
      }
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    return res.status(500).json({ status: false, message: 'Server error during signup', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const query = username ? { username } : { email };
    const user = await User.findOne(query);

    if (!user) {
      logger.warn(`Login failed: User not found`, { identifier: username || email });
      return res.status(400).json({ status: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Incorrect password for user`, { userId: user._id });
      return res.status(400).json({ status: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`User logged in successfully: ${user.username}`);

    return res.status(200).json({
      status: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({ status: false, message: 'Server error during login', error: error.message });
  }
};