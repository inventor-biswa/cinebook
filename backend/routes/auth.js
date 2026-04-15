const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { sendOtp, verifyOtp } = require('../controllers/otp.controller');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login  (password-based)
router.post('/login', login);

// POST /api/auth/otp/send    Body: { email }
router.post('/otp/send', sendOtp);

// POST /api/auth/otp/verify  Body: { email, otp }
router.post('/otp/verify', verifyOtp);

module.exports = router;
