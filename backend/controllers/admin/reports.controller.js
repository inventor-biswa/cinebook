const pool = require('../../config/db');

// ─── ADMIN: GET DASHBOARD STATS ─────────────────────────────────────────────
// GET /api/admin/reports/stats
exports.getStats = async (req, res) => {
    try {
        // 1. Total Revenue (from confirmed bookings)
        const [revenueRows] = await pool.query(
            "SELECT SUM(total_amount) AS total_revenue FROM bookings WHERE status = 'confirmed'"
        );

        // 2. Total Bookings count
        const [bookingRows] = await pool.query(
            "SELECT COUNT(*) AS total_bookings FROM bookings WHERE status = 'confirmed'"
        );

        // 3. User stats
        const [userRows] = await pool.query(
            "SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'"
        );

        // 4. Movies vs Events count
        const [movieCount] = await pool.query("SELECT COUNT(*) AS count FROM movies");
        const [eventCount] = await pool.query("SELECT COUNT(*) AS count FROM events");

        res.json({
            revenue: revenueRows[0].total_revenue || 0,
            bookings: bookingRows[0].total_bookings || 0,
            users: userRows[0].total_users || 0,
            movies: movieCount[0].count,
            events: eventCount[0].count
        });
    } catch (error) {
        console.error('Admin getStats error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats.' });
    }
};

// ─── ADMIN: GET REVENUE BY ITEM ─────────────────────────────────────────────
// GET /api/admin/reports/revenue-by-item
exports.getRevenueByItem = async (req, res) => {
    try {
        // Combined revenue for Movies and Events
        const [rows] = await pool.query(`
            SELECT COALESCE(m.title, e.title) AS title, 
                   SUM(b.total_amount) AS revenue,
                   COUNT(b.booking_id) AS ticket_count
            FROM bookings b
            JOIN shows s ON b.show_id = s.show_id
            LEFT JOIN movies m ON s.movie_id = m.movie_id
            LEFT JOIN events e ON s.event_id = e.event_id
            WHERE b.status = 'confirmed'
            GROUP BY title
            ORDER BY revenue DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Admin getRevenueByItem error:', error);
        res.status(500).json({ message: 'Server error fetching revenue breakdown.' });
    }
};

// ─── ADMIN: GET RECENT BOOKINGS ─────────────────────────────────────────────
// GET /api/admin/reports/recent
exports.getRecentBookings = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.booking_id, b.total_amount, b.booked_at, u.name AS user_name,
                   COALESCE(m.title, e.title) AS title
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN shows s ON b.show_id = s.show_id
            LEFT JOIN movies m ON s.movie_id = m.movie_id
            LEFT JOIN events e ON s.event_id = e.event_id
            ORDER BY b.booked_at DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (error) {
        console.error('Admin getRecentBookings error:', error);
        res.status(500).json({ message: 'Server error fetching recent bookings.' });
    }
};
