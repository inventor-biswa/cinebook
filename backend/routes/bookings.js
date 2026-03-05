const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBooking, getMyBookings } = require('../controllers/bookings.controller');

// Both routes are PROTECTED. Users must be logged in.

// POST /api/bookings
router.post('/', auth, createBooking);

// GET /api/bookings
router.get('/', auth, getMyBookings);

module.exports = router;
