const express = require('express');
const router = express.Router();
const { getShowSeats } = require('../controllers/shows.controller');

// GET /api/shows/:id/seats
router.get('/:id/seats', getShowSeats);

module.exports = router;
