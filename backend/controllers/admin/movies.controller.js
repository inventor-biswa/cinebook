const pool = require('../../config/db');
const tmdb = require('../../utils/tmdb');


// ─── ADMIN: GET ALL MOVIES ───────────────────────────────────────────────────
// GET /api/admin/movies
exports.getAllMovies = async (req, res) => {
    try {
        const [movies] = await pool.query('SELECT * FROM movies ORDER BY release_date DESC');
        res.json(movies);
    } catch (error) {
        console.error('Admin getAllMovies error:', error);
        res.status(500).json({ message: 'Server error fetching movies.' });
    }
};

// ─── ADMIN: CREATE MOVIE ─────────────────────────────────────────────────────
// POST /api/admin/movies
exports.createMovie = async (req, res) => {
    try {
        const { title, genre, language, description, cast_info, poster_url, trailer_url, release_date, is_trending, status } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Movie title is required.' });
        }

        const [result] = await pool.query(
            `INSERT INTO movies 
       (title, genre, language, description, cast_info, poster_url, trailer_url, release_date, is_trending, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, genre, language, description, cast_info, poster_url, trailer_url, release_date, is_trending || false, status || 'coming_soon']
        );

        res.status(201).json({ message: 'Movie created successfully.', movie_id: result.insertId });
    } catch (error) {
        console.error('Admin createMovie error:', error);
        res.status(500).json({ message: 'Server error creating movie.' });
    }
};

// ─── ADMIN: UPDATE MOVIE ─────────────────────────────────────────────────────
// PUT /api/admin/movies/:id
exports.updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, genre, language, description, cast_info, poster_url, trailer_url, release_date, is_trending, status } = req.body;

        const [result] = await pool.query(
            `UPDATE movies 
       SET title=?, genre=?, language=?, description=?, cast_info=?, poster_url=?, trailer_url=?, release_date=?, is_trending=?, status=?
       WHERE movie_id=?`,
            [title, genre, language, description, cast_info, poster_url, trailer_url, release_date, is_trending, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        res.json({ message: 'Movie updated successfully.' });
    } catch (error) {
        console.error('Admin updateMovie error:', error);
        res.status(500).json({ message: 'Server error updating movie.' });
    }
};

// ─── ADMIN: DELETE MOVIE ─────────────────────────────────────────────────────
// DELETE /api/admin/movies/:id
exports.deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        // Note: In a real production app, we might soft-delete or check if it has shows first.
        // For this project, we will just delete it directly (will fail if foreign key constraint blocks it).
        const [result] = await pool.query('DELETE FROM movies WHERE movie_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        res.json({ message: 'Movie deleted successfully.' });
    } catch (error) {
        console.error('Admin deleteMovie error:', error);
        // 1451 is the MySQL error code for "Cannot delete or update a parent row: a foreign key constraint fails"
        if (error.errno === 1451) {
            return res.status(400).json({ message: 'Cannot delete movie because it has associated shows.' });
        }
        res.status(500).json({ message: 'Server error deleting movie.' });
    }
};

// ─── ADMIN: FETCH MOVIE META FROM TMDB ───────────────────────────────────────
// POST /api/admin/movies/fetch-meta
exports.fetchMovieMeta = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required to fetch metadata.' });
        }

        const results = await tmdb.searchMovie(title);
        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'No movies found on TMDb.' });
        }

        // Get details for the first/best match
        const bestMatch = results[0];
        const details = await tmdb.getMovieDetails(bestMatch.id);
        const formatted = tmdb.formatMovieData(details);

        res.json(formatted);
    } catch (error) {
        console.error('Admin fetchMovieMeta error:', error.message);
        if (error.code === 'NETWORK_ERROR') {
            return res.status(503).json({ message: 'TMDb API is unreachable. Your network may be blocking it. Try enabling a VPN and retry.' });
        }
        res.status(500).json({ message: 'Error fetching metadata from TMDb.' });
    }
};
