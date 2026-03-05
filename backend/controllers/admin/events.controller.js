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

// ─── ADMIN: DELETE EVENT ─────────────────────────────────────────────────────
// DELETE /api/admin/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Attempt deletion
        const [result] = await pool.query('DELETE FROM events WHERE event_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
        console.error('Admin deleteEvent error:', error);
        // 1451 is the MySQL error code for foreign key constraint failure
        if (error.errno === 1451) {
            return res.status(400).json({ message: 'Cannot delete event because it has associated shows.' });
        }
        res.status(500).json({ message: 'Server error deleting event.' });
    }
};
