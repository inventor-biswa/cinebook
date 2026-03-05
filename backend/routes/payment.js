const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createOrder, verifyPayment } = require('../controllers/payment.controller');

// Both routes are PROTECTED
// The user must be logged in to pay for their booking

// POST /api/payment/create-order
router.post('/create-order', auth, createOrder);

// POST /api/payment/verify
router.post('/verify', auth, verifyPayment);

module.exports = router;
