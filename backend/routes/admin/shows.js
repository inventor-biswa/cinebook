const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');
const { getAllShows, createShow, deleteShow } = require('../../controllers/admin/shows.controller');

// ALL routes here are protected by BOTH auth and isAdmin middleware
router.use(auth, isAdmin);

// GET /api/admin/shows
router.get('/', getAllShows);

// POST /api/admin/shows
router.post('/', createShow);

// DELETE /api/admin/shows/:id
router.delete('/:id', deleteShow);

module.exports = router;
