const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendations.controller');
const auth = require('../middleware/auth');

// GET /api/recommendations  — requires auth
router.get('/', auth, getRecommendations);

module.exports = router;
