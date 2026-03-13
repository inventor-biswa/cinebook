const pool = require('../../config/db');

// ─── ADMIN: GET ALL THEATRES ──────────────────────────────────────────────────
// GET /api/admin/theatres
exports.getAllTheatres = async (req, res) => {
    try {
        const [theatres] = await pool.query(
            `SELECT t.*, c.name AS city_name 
             FROM theatres t 
             JOIN cities c ON t.city_id = c.city_id
             ORDER BY t.name ASC`
        );
        res.json(theatres);
    } catch (error) {
        console.error('Admin getAllTheatres error:', error);
        res.status(500).json({ message: 'Server error fetching theatres.' });
    }
};

// ─── ADMIN: CREATE THEATRE ────────────────────────────────────────────────────
// POST /api/admin/theatres
exports.createTheatre = async (req, res) => {
    try {
        const { city_id, name, address, total_seats } = req.body;

        if (!city_id || !name) {
            return res.status(400).json({ message: 'city_id and name are required.' });
        }

        // total_seats maps to total_rows * seats_per_row
        // We store as 10 rows × N seats_per_row (default 10×10 = 100)
        const rows = 10;
        const seatsPerRow = Math.ceil((parseInt(total_seats) || 100) / rows);

        const [result] = await pool.query(
            `INSERT INTO theatres 
             (city_id, name, address, total_rows, seats_per_row) 
             VALUES (?, ?, ?, ?, ?)`,
            [city_id, name, address || null, rows, seatsPerRow]
        );

        res.status(201).json({ message: 'Theatre created successfully.', theatre_id: result.insertId });
    } catch (error) {
        console.error('Admin createTheatre error:', error);
        res.status(500).json({ message: 'Server error creating theatre.' });
    }
};

// ─── ADMIN: UPDATE THEATRE ────────────────────────────────────────────────────
// PUT /api/admin/theatres/:id
exports.updateTheatre = async (req, res) => {
    try {
        const { id } = req.params;
        const { city_id, name, address, total_seats } = req.body;

        if (!city_id || !name) {
            return res.status(400).json({ message: 'city_id and name are required.' });
        }

        const rows = 10;
        const seatsPerRow = Math.ceil((parseInt(total_seats) || 100) / rows);

        const [result] = await pool.query(
            `UPDATE theatres 
             SET city_id=?, name=?, address=?, total_rows=?, seats_per_row=?
             WHERE theatre_id=?`,
            [city_id, name, address || null, rows, seatsPerRow, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Theatre not found.' });
        }

        res.json({ message: 'Theatre updated successfully.' });
    } catch (error) {
        console.error('Admin updateTheatre error:', error);
        res.status(500).json({ message: 'Server error updating theatre.' });
    }
};

// ─── ADMIN: DELETE THEATRE ────────────────────────────────────────────────────
// DELETE /api/admin/theatres/:id
exports.deleteTheatre = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM theatres WHERE theatre_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Theatre not found.' });
        }

        res.json({ message: 'Theatre deleted successfully.' });
    } catch (error) {
        console.error('Admin deleteTheatre error:', error);
        if (error.errno === 1451) {
            return res.status(400).json({ message: 'Cannot delete theatre because it has associated shows.' });
        }
        res.status(500).json({ message: 'Server error deleting theatre.' });
    }
};
