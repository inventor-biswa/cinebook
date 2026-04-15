const pool = require('../../config/db');

// ─── ADMIN: GET ALL EVENTS ───────────────────────────────────────────────────
// GET /api/admin/events
exports.getAllEvents = async (req, res) => {
    try {
        const [events] = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
        res.json(events);
    } catch (error) {
        console.error('Admin getAllEvents error:', error);
        res.status(500).json({ message: 'Server error fetching events.' });
    }
};

// ─── ADMIN: CREATE EVENT ─────────────────────────────────────────────────────
// POST /api/admin/events
exports.createEvent = async (req, res) => {
    try {
        const { title, description, category, poster_url, is_trending } = req.body;

        if (!title || !category) {
            return res.status(400).json({ message: 'Event title and category are required.' });
        }

        const [result] = await pool.query(
            `INSERT INTO events 
       (title, description, category, poster_url, is_trending) 
       VALUES (?, ?, ?, ?, ?)`,
            [title, description, category, poster_url, is_trending || false]
        );

        res.status(201).json({ message: 'Event created successfully.', event_id: result.insertId });
    } catch (error) {
        console.error('Admin createEvent error:', error);
        res.status(500).json({ message: 'Server error creating event.' });
    }
};

// ─── ADMIN: UPDATE EVENT ─────────────────────────────────────────────────────
// PUT /api/admin/events/:id
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, poster_url, is_trending } = req.body;

        const [result] = await pool.query(
            `UPDATE events 
       SET title=?, description=?, category=?, poster_url=?, is_trending=?
       WHERE event_id=?`,
            [title, description, category, poster_url, is_trending, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.json({ message: 'Event updated successfully.' });
    } catch (error) {
        console.error('Admin updateEvent error:', error);
        res.status(500).json({ message: 'Server error updating event.' });
    }
};

// ─── ADMIN: DELETE EVENT ────────────────────────────────────────────────
// DELETE /api/admin/events/:id
exports.deleteEvent = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        await connection.beginTransaction();

        // 1. Find all shows linked to this event
        const [shows] = await connection.query(
            'SELECT show_id FROM shows WHERE event_id = ?', [id]
        );
        const showIds = shows.map(s => s.show_id);

        if (showIds.length > 0) {
            // 2. Delete booking_seats for all bookings of these shows
            await connection.query(
                `DELETE bs FROM booking_seats bs
                 JOIN bookings b ON bs.booking_id = b.booking_id
                 WHERE b.show_id IN (?)`, [showIds]
            );
            // 3. Delete bookings for these shows
            await connection.query('DELETE FROM bookings WHERE show_id IN (?)', [showIds]);
            // 4. Delete seats for these shows
            await connection.query('DELETE FROM seats WHERE show_id IN (?)', [showIds]);
            // 5. Delete the shows
            await connection.query('DELETE FROM shows WHERE event_id = ?', [id]);
        }

        // 6. Delete the event
        const [result] = await connection.query('DELETE FROM events WHERE event_id = ?', [id]);
        await connection.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        res.json({ message: 'Event and its associated shows deleted successfully.' });
    } catch (error) {
        await connection.rollback();
        console.error('Admin deleteEvent error:', error);
        res.status(500).json({ message: 'Server error deleting event.' });
    } finally {
        connection.release();
    }
};
