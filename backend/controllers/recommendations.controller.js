const pool = require('../config/db');

// ─── GET RECOMMENDATIONS ─────────────────────────────────────────────────────
// GET /api/recommendations
// Returns movies matching the user's past booking genres, sorted by is_trending.
// Falls back to global trending if no booking history.
// Requires Auth.

exports.getRecommendations = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        // 1. Get genres from user's past bookings
        const [historyRows] = await pool.query(`
            SELECT DISTINCT m.genre
            FROM bookings b
            JOIN shows s ON b.show_id = s.show_id
            JOIN movies m ON s.movie_id = m.movie_id
            WHERE b.user_id = ? AND m.genre IS NOT NULL
            LIMIT 10
        `, [user_id]);

        // 2. Get movie IDs already booked by this user
        const [bookedRows] = await pool.query(`
            SELECT DISTINCT s.movie_id
            FROM bookings b
            JOIN shows s ON b.show_id = s.show_id
            WHERE b.user_id = ? AND s.movie_id IS NOT NULL
        `, [user_id]);
        const bookedIds = bookedRows.map(r => r.movie_id);

        if (historyRows.length === 0) {
            // No history — return trending movies
            const [trending] = await pool.query(`
                SELECT movie_id, title, genre, language, poster_url, release_date, is_trending, status
                FROM movies
                WHERE status IN ('now_showing', 'coming_soon') AND is_trending = true
                ORDER BY release_date DESC
                LIMIT 10
            `);
            return res.json(trending);
        }

        // 3. Extract genre keywords
        const genreKeywords = [...new Set(
            historyRows.flatMap(r => r.genre.split(',').map(g => g.trim().toLowerCase()))
        )];

        // 4. Build LIKE conditions for each genre keyword
        const likeClauses = genreKeywords.map(() => 'LOWER(m.genre) LIKE ?').join(' OR ');
        const likeParams  = genreKeywords.map(g => `%${g}%`);

        let excludeClause = '';
        let excludeParams = [];
        if (bookedIds.length > 0) {
            excludeClause = `AND m.movie_id NOT IN (${bookedIds.map(() => '?').join(',')})`;
            excludeParams = bookedIds;
        }

        const [movies] = await pool.query(`
            SELECT m.movie_id, m.title, m.genre, m.language, m.poster_url, m.release_date, m.is_trending, m.status
            FROM movies m
            WHERE m.status IN ('now_showing', 'coming_soon')
              AND (${likeClauses})
              ${excludeClause}
            ORDER BY m.is_trending DESC, m.release_date DESC
            LIMIT 12
        `, [...likeParams, ...excludeParams]);

        res.json(movies);
    } catch (err) {
        console.error('getRecommendations error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};
