const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');
const { getAllTheatres, createTheatre, updateTheatre, deleteTheatre } = require('../../controllers/admin/theatres.controller');

// ALL routes here are protected by BOTH auth and isAdmin middleware
router.use(auth, isAdmin);

// GET /api/admin/theatres
router.get('/', getAllTheatres);

// POST /api/admin/theatres
router.post('/', createTheatre);

// PUT /api/admin/theatres/:id
router.put('/:id', updateTheatre);

// DELETE /api/admin/theatres/:id
router.delete('/:id', deleteTheatre);

module.exports = router;
