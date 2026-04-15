const pool = require('../config/db');

// ─── CREATE BOOKING (TRANSACTION) ───────────────────────────────────────────
// POST /api/bookings
// Body: { show_id, seat_ids: [1, 2, 3] }
// Requires Auth

exports.createBooking = async (req, res) => {
    const { show_id, seat_ids } = req.body;
    const user_id = req.user.user_id; // From auth.js middleware

    if (!show_id || !seat_ids || seat_ids.length === 0) {
        return res.status(400).json({ message: 'show_id and seat_ids are required.' });
    }

    // Get a dedicated connection from the pool so we can run a Transaction
    const connection = await pool.getConnection();

    try {
        // 1. Start Transaction
        await connection.beginTransaction();

        // 2. Fetch the show price and available seats
        //    FOR UPDATE locks this row so no other transaction can modify it
        //    until we are done (prevents double booking).
        const [shows] = await connection.query(
            'SELECT price, available_seats FROM shows WHERE show_id = ? FOR UPDATE',
            [show_id]
        );

        if (shows.length === 0) {
            throw new Error('Show not found.');
        }

        const show = shows[0];
        const totalAmount = show.price * seat_ids.length;

        if (show.available_seats < seat_ids.length) {
            throw new Error('Not enough available seats left for this show.');
        }

        // 3. Verify all requested seats are still available
        //    FOR UPDATE locks these specific seat rows too.
        const [seats] = await connection.query(
            'SELECT seat_id, is_booked FROM seats WHERE seat_id IN (?) FOR UPDATE',
            [seat_ids]
        );

        if (seats.length !== seat_ids.length) {
            throw new Error('One or more invalid seats provided.');
        }

        const alreadyBooked = seats.some((seat) => seat.is_booked);
        if (alreadyBooked) {
            // Someone else just booked it milliseconds ago!
            throw new Error('One or more of the selected seats are already booked.');
        }

        // 4. Create the Booking record (initially 'pending' until payment is done)
        const [bookingResult] = await connection.query(
            'INSERT INTO bookings (user_id, show_id, total_amount, status) VALUES (?, ?, ?, "pending")',
            [user_id, show_id, totalAmount]
        );
        const booking_id = bookingResult.insertId;

        // Generate human-readable booking reference: QS-YYYYMMDD-XXXX
        const now = new Date();
        const datePart = now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0');
        const booking_ref = `QS-${datePart}-${String(booking_id).padStart(4, '0')}`;
        await connection.query(
            'UPDATE bookings SET booking_ref = ? WHERE booking_id = ?',
            [booking_ref, booking_id]
        );

        // 5. Mark seats as booked
        await connection.query(
            'UPDATE seats SET is_booked = true WHERE seat_id IN (?)',
            [seat_ids]
        );

        // 6. Link seats to this booking in the junction table
        const bookingSeatsData = seat_ids.map((seat_id) => [booking_id, seat_id]);
        await connection.query(
            'INSERT INTO booking_seats (booking_id, seat_id) VALUES ?',
            [bookingSeatsData]
        );

        // 7. Decrement available_seats in the shows table
        await connection.query(
            'UPDATE shows SET available_seats = available_seats - ? WHERE show_id = ?',
            [seat_ids.length, show_id]
        );

        // 8. Award reward points (₹1 spent = 1 point)
        const pointsEarned = Math.floor(totalAmount);
        await connection.query(
            'UPDATE users SET reward_points = reward_points + ? WHERE user_id = ?',
            [pointsEarned, user_id]
        );

        // 9. Commit the Transaction — all changes are saved at exactly the same time!
        await connection.commit();

        res.status(201).json({
            message: 'Booking created successfully. Status is pending payment.',
            booking_id,
            booking_ref,
            points_earned: pointsEarned,
            total_amount: totalAmount
        });

    } catch (error) {
        // If ANY step above failed, rollback EVERYTHING. 
        // No partial bookings. No stuck seats.
        await connection.rollback();
        console.error('Booking transaction failed:', error.message);

        // Distinguish between our custom validation errors and genuine SQL/Server errors
        if (error.message.includes('seats') || error.message.includes('Show')) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Server error during booking process.' });
        }
    } finally {
        // ALWAYS release the connection back to the pool, even if it crashed.
        connection.release();
    }
};


// ─── GET MY BOOKINGS ─────────────────────────────────────────────────────────
// GET /api/bookings
// Requires Auth
// Returns all bookings for the currently logged-in user.

exports.getMyBookings = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        // Join bookings with shows, movies/events, and theatres to give a rich history
        const [bookings] = await pool.query(`
      SELECT b.booking_id, b.booking_ref, b.total_amount, b.status, b.booked_at,
             s.show_date, s.show_time,
             t.name AS theatre_name,
             COALESCE(m.title, e.title) AS title,
             COALESCE(m.poster_url, e.poster_url) AS poster_url,
             GROUP_CONCAT(seats.seat_label) AS seat_labels
      FROM bookings b
      JOIN shows s ON b.show_id = s.show_id
      JOIN theatres t ON s.theatre_id = t.theatre_id
      LEFT JOIN movies m ON s.movie_id = m.movie_id
      LEFT JOIN events e ON s.event_id = e.event_id
      JOIN booking_seats bs ON bs.booking_id = b.booking_id
      JOIN seats ON seats.seat_id = bs.seat_id
      WHERE b.user_id = ?
      GROUP BY b.booking_id
      ORDER BY b.booked_at DESC
    `, [user_id]);

        res.json(bookings);

    } catch (error) {
        console.error('getMyBookings error:', error);
        res.status(500).json({ message: 'Server error fetching bookings.' });
    }
};
