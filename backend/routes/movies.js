const express = require('express');
const router = express.Router();
const { getAllMovies, getMovieById, getTrending } = require('../controllers/movies.controller');

// GET /api/movies/trending  — must be BEFORE /:id to avoid "trending" being treated as an id param
router.get('/trending', getTrending);

// GET /api/movies?city_id=1
router.get('/', getAllMovies);

// GET /api/movies/:id?city_id=1
router.get('/:id', getMovieById);

module.exports = router;
