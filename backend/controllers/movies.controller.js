const pool = require('../config/db');

// ─── GET ALL MOVIES ──────────────────────────────────────────────────────────
// GET /api/movies?city_id=1
// Returns all "now_showing" movies that have at least one show in the given city.
// If no city_id is passed, returns all now_showing movies globally.

exports.getAllMovies = async (req, res) => {
    try {
        const { city_id } = req.query;

        let query;
        let params;

        if (city_id) {
            // JOIN: movies → shows → theatres → cities
            // DISTINCT ensures we don't return the same movie multiple times
            // even if it has multiple shows in that city.
            query = `
        SELECT DISTINCT m.movie_id, m.title, m.genre, m.language,
               m.poster_url, m.release_date, m.is_trending, m.status
        FROM movies m
        JOIN shows s ON m.movie_id = s.movie_id
        JOIN theatres t ON s.theatre_id = t.theatre_id
        WHERE t.city_id = ? AND m.status = 'now_showing'
        ORDER BY m.release_date DESC
      `;
            params = [city_id];
        } else {
            // No city filter — return all now_showing movies
            query = `
        SELECT movie_id, title, genre, language, poster_url,
               release_date, is_trending, status
        FROM movies
        WHERE status = 'now_showing'
        ORDER BY release_date DESC
      `;
            params = [];
        }

        const [movies] = await pool.query(query, params);
        res.json(movies);

    } catch (error) {
        console.error('getAllMovies error:', error);
        res.status(500).json({ message: 'Server error fetching movies.' });
    }
};


// ─── GET SINGLE MOVIE ────────────────────────────────────────────────────────
// GET /api/movies/:id
// Returns full movie details + all upcoming shows for that movie.
// Optionally filtered by city: GET /api/movies/:id?city_id=1

exports.getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const { city_id } = req.query;

        // 1. Fetch the movie record
        const [rows] = await pool.query(
            'SELECT * FROM movies WHERE movie_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        const movie = rows[0];

        // 2. Fetch upcoming shows for this movie (today or in the future)
        //    Optionally filtered by city via theatre → city join
        let showQuery;
        let showParams;

        if (city_id) {
            showQuery = `
        SELECT s.show_id, s.show_date, s.show_time, s.price, s.available_seats,
               t.name AS theatre_name, t.theatre_id, c.name AS city_name
        FROM shows s
        JOIN theatres t ON s.theatre_id = t.theatre_id
        JOIN cities c ON t.city_id = c.city_id
        WHERE s.movie_id = ? AND t.city_id = ? AND s.show_date >= CURDATE()
        ORDER BY s.show_date ASC, s.show_time ASC
      `;
            showParams = [id, city_id];
        } else {
            showQuery = `
        SELECT s.show_id, s.show_date, s.show_time, s.price, s.available_seats,
               t.name AS theatre_name, t.theatre_id, c.name AS city_name
        FROM shows s
        JOIN theatres t ON s.theatre_id = t.theatre_id
        JOIN cities c ON t.city_id = c.city_id
        WHERE s.movie_id = ? AND s.show_date >= CURDATE()
        ORDER BY s.show_date ASC, s.show_time ASC
      `;
            showParams = [id];
        }

        const [shows] = await pool.query(showQuery, showParams);

        // 3. Return movie details + its shows together in one response
        res.json({ ...movie, shows });

    } catch (error) {
        console.error('getMovieById error:', error);
        res.status(500).json({ message: 'Server error fetching movie.' });
    }
};


// ─── GET TRENDING ────────────────────────────────────────────────────────────
// GET /api/movies/trending
// Returns all movies (and events) marked as trending by admin

exports.getTrending = async (req, res) => {
    try {
        const [movies] = await pool.query(
            `SELECT movie_id AS id, title, poster_url, 'movie' AS type
       FROM movies WHERE is_trending = true AND status = 'now_showing'`
        );

        const [events] = await pool.query(
            `SELECT event_id AS id, title, poster_url, 'event' AS type
       FROM events WHERE is_trending = true`
        );

        res.json([...movies, ...events]);

    } catch (error) {
        console.error('getTrending error:', error);
        res.status(500).json({ message: 'Server error fetching trending.' });
    }
};
