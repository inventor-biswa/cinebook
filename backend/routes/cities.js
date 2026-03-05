const express = require('express');
const router = express.Router();
const { getAllCities } = require('../controllers/cities.controller');

// GET /api/cities
router.get('/', getAllCities);

module.exports = router;
