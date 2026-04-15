const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');
const { getAllMovies, createMovie, updateMovie, deleteMovie } = require('../../controllers/admin/movies.controller');

// ALL routes here are protected by BOTH auth and isAdmin middleware
router.use(auth, isAdmin);

// GET /api/admin/movies
router.get('/', getAllMovies);

// POST /api/admin/movies
router.post('/', createMovie);

// POST /api/admin/movies/fetch-meta
router.post('/fetch-meta', require('../../controllers/admin/movies.controller').fetchMovieMeta);

// POST /api/admin/movies/bulk-import
router.post('/bulk-import', require('../../controllers/admin/movies.controller').bulkImportMovies);

// PUT /api/admin/movies/:id
router.put('/:id', updateMovie);

// DELETE /api/admin/movies/:id
router.delete('/:id', deleteMovie);

module.exports = router;
