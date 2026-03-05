const pool = require('../config/db');

// ─── GET SHOW SEATS ──────────────────────────────────────────────────────────
// GET /api/shows/:id/seats
// Returns basic show details (time, price, theatre) + all seats for the show.
// Used by the frontend Seat Selection page.

exports.getShowSeats = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Fetch show details (to get price, time, theatre name)
        const [shows] = await pool.query(
            `SELECT s.show_id, s.show_date, s.show_time, s.price, s.available_seats,
              t.name AS theatre_name
       FROM shows s
       JOIN theatres t ON s.theatre_id = t.theatre_id
       WHERE s.show_id = ?`,
            [id]
        );

        if (shows.length === 0) {
            return res.status(404).json({ message: 'Show not found.' });
        }

        const show = shows[0];

        // 2. Fetch all seats for this show (along with their booking status)
        const [seats] = await pool.query(
            'SELECT seat_id, seat_label, is_booked FROM seats WHERE show_id = ? ORDER BY seat_label ASC',
            [id]
        );

        // Return the combined payload
        res.json({
            show,
            seats
        });

    } catch (error) {
        console.error('getShowSeats error:', error);
        res.status(500).json({ message: 'Server error fetching seats.' });
    }
};
