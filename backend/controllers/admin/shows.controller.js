const pool = require('../../config/db');

// ─── ADMIN: GET ALL SHOWS ────────────────────────────────────────────────────
// GET /api/admin/shows
exports.getAllShows = async (req, res) => {
    try {
        const [shows] = await pool.query(`
            SELECT s.*, t.name AS theatre_name, c.name AS city_name,
                   COALESCE(m.title, e.title) AS title
            FROM shows s
            JOIN theatres t ON s.theatre_id = t.theatre_id
            JOIN cities c ON t.city_id = c.city_id
            LEFT JOIN movies m ON s.movie_id = m.movie_id
            LEFT JOIN events e ON s.event_id = e.event_id
            ORDER BY s.show_date DESC, s.show_time DESC
        `);
        res.json(shows);
    } catch (error) {
        console.error('Admin getAllShows error:', error);
        res.status(500).json({ message: 'Server error fetching shows.' });
    }
};

// ─── ADMIN: CREATE SHOW + AUTO SEAT GENERATION ───────────────────────────────
// POST /api/admin/shows
// Body: { movie_id, event_id, theatre_id, show_date, show_time, price }
exports.createShow = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { movie_id, event_id, theatre_id, show_date, show_time, price } = req.body;

        if (!theatre_id || !show_date || !show_time || !price) {
            return res.status(400).json({ message: 'theatre_id, show_date, show_time, and price are required.' });
        }

        // 1. Insert the Show (Default 100 seats)
        const [showResult] = await connection.query(
            `INSERT INTO shows 
             (movie_id, event_id, theatre_id, show_date, show_time, price, available_seats) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [movie_id || null, event_id || null, theatre_id, show_date, show_time, price, 100]
        );

        const show_id = showResult.insertId;

        // 2. AUTO-GENERATE 100 SEATS (Rows A-J, 10 seats each)
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const seatValues = [];

        for (const row of rows) {
            for (let i = 1; i <= 10; i++) {
                seatValues.push([show_id, `${row}${i}`, false]);
            }
        }

        await connection.query(
            'INSERT INTO seats (show_id, seat_label, is_booked) VALUES ?',
            [seatValues]
        );

        await connection.commit();
        res.status(201).json({
            message: 'Show created successfully with 100 generated seats.',
            show_id
        });

    } catch (error) {
        await connection.rollback();
        console.error('Admin createShow error:', error);
        res.status(500).json({ message: 'Server error creating show.' });
    } finally {
        connection.release();
    }
};

// ─── ADMIN: DELETE SHOW ──────────────────────────────────────────────────────
// DELETE /api/admin/shows/:id
exports.deleteShow = async (req, res) => {
    try {
        const { id } = req.params;

        // Deleting a show will also delete its seats due to ON DELETE CASCADE
        const [result] = await pool.query('DELETE FROM shows WHERE show_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Show not found.' });
        }

        res.json({ message: 'Show deleted successfully.' });
    } catch (error) {
        console.error('Admin deleteShow error:', error);
        if (error.errno === 1451) {
            return res.status(400).json({ message: 'Cannot delete show because it has associated bookings.' });
        }
        res.status(500).json({ message: 'Server error deleting show.' });
    }
};
