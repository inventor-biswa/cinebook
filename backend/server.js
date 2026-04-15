const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
// Allow the React frontend (running on port 5173) to call this API (port 5000)
app.use(cors());

// Parse incoming JSON request bodies so we can read req.body
app.use(express.json());


// ─── Route Imports ────────────────────────────────────────────────────────────
// We'll import and register routes here as we build them.
// Each route file handles one resource (auth, movies, bookings, etc.)

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const moviesRoutes = require('./routes/movies');
app.use('/api/movies', moviesRoutes);

const eventsRoutes = require('./routes/events');
app.use('/api/events', eventsRoutes);

const citiesRoutes = require('./routes/cities');
app.use('/api/cities', citiesRoutes);

const showsRoutes = require('./routes/shows');
app.use('/api/shows', showsRoutes);

const bookingsRoutes = require('./routes/bookings');
app.use('/api/bookings', bookingsRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

const adminMoviesRoutes = require('./routes/admin/movies');
app.use('/api/admin/movies', adminMoviesRoutes);

const adminEventsRoutes = require('./routes/admin/events');
app.use('/api/admin/events', adminEventsRoutes);

const adminTheatresRoutes = require('./routes/admin/theatres');
app.use('/api/admin/theatres', adminTheatresRoutes);

const adminShowsRoutes = require('./routes/admin/shows');
app.use('/api/admin/shows', adminShowsRoutes);

const adminReportsRoutes = require('./routes/admin/reports');
app.use('/api/admin/reports', adminReportsRoutes);

const offersRoutes = require('./routes/offers');
app.use('/api/offers', offersRoutes);

const recommendationsRoutes = require('./routes/recommendations');
app.use('/api/recommendations', recommendationsRoutes);


// ─── Health Check ─────────────────────────────────────────────────────────────
// A simple GET route to confirm the server is running correctly
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'CineBook API is running!' });
});


// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
