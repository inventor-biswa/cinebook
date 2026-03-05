const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// POST /api/auth/register  →  controllers/auth.controller.js → register
router.post('/register', register);

// POST /api/auth/login  →  controllers/auth.controller.js → login
router.post('/login', login);

module.exports = router;
