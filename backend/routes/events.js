const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById } = require('../controllers/events.controller');

// GET /api/events?city_id=1
router.get('/', getAllEvents);

// GET /api/events/:id?city_id=1
router.get('/:id', getEventById);

module.exports = router;
