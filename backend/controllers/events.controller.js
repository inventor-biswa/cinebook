const pool = require('../config/db');

// ─── GET ALL EVENTS ──────────────────────────────────────────────────────────
// GET /api/events?city_id=1
// Events can be city-specific (have shows in theatres) or city-agnostic.

exports.getAllEvents = async (req, res) => {
    try {
        const { city_id } = req.query;

        let query, params;

        if (city_id) {
            // Join shows → theatres to filter events by city
            query = `
        SELECT DISTINCT e.event_id, e.title, e.category, e.poster_url,
               e.is_trending, e.created_at
        FROM events e
        JOIN shows s ON e.event_id = s.event_id
        JOIN theatres t ON s.theatre_id = t.theatre_id
        WHERE t.city_id = ?
        ORDER BY e.created_at DESC
      `;
            params = [city_id];
        } else {
            query = `
        SELECT event_id, title, category, poster_url, is_trending, created_at
        FROM events
        ORDER BY created_at DESC
      `;
            params = [];
        }

        const [events] = await pool.query(query, params);
        res.json(events);

    } catch (error) {
        console.error('getAllEvents error:', error);
        res.status(500).json({ message: 'Server error fetching events.' });
    }
};


// ─── GET SINGLE EVENT ────────────────────────────────────────────────────────
// GET /api/events/:id?city_id=1
// Returns full event details + upcoming shows for that event.

exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const { city_id } = req.query;

        // 1. Fetch the event record
        const [rows] = await pool.query(
            'SELECT * FROM events WHERE event_id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        const event = rows[0];

        // 2. Fetch upcoming shows for this event
        let showQuery, showParams;

        if (city_id) {
            showQuery = `
        SELECT s.show_id, s.show_date, s.show_time, s.price, s.available_seats,
               t.name AS theatre_name, t.theatre_id, c.name AS city_name
        FROM shows s
        JOIN theatres t ON s.theatre_id = t.theatre_id
        JOIN cities c ON t.city_id = c.city_id
        WHERE s.event_id = ? AND t.city_id = ? AND s.show_date >= CURDATE()
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
        WHERE s.event_id = ? AND s.show_date >= CURDATE()
        ORDER BY s.show_date ASC, s.show_time ASC
      `;
            showParams = [id];
        }

        const [shows] = await pool.query(showQuery, showParams);

        res.json({ ...event, shows });

    } catch (error) {
        console.error('getEventById error:', error);
        res.status(500).json({ message: 'Server error fetching event.' });
    }
};
