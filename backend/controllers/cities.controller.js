const pool = require('../config/db');

// ─── GET ALL CITIES ──────────────────────────────────────────────────────────
// GET /api/cities
// Returns all cities. Used by the frontend city-selector on first visit.

exports.getAllCities = async (req, res) => {
    try {
        const [cities] = await pool.query(
            'SELECT city_id, name FROM cities ORDER BY name ASC'
        );
        res.json(cities);
    } catch (error) {
        console.error('getAllCities error:', error);
        res.status(500).json({ message: 'Server error fetching cities.' });
    }
};
