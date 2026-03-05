import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// ─── Page Imports ──────────────────────────────────────────────────────────────
// Public Pages
import Home from './pages/Home';
import AllMovies from './pages/AllMovies';
import MovieDetail from './pages/MovieDetail';
import AllEvents from './pages/AllEvents';
import EventDetail from './pages/EventDetail';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages (login required)
import SeatSelection from './pages/SeatSelection';
import BookingConfirm from './pages/BookingConfirm';
import MyBookings from './pages/MyBookings';

// Admin Pages (admin role required)
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageMovies from './pages/admin/ManageMovies';
import ManageEvents from './pages/admin/ManageEvents';
import ManageTheatres from './pages/admin/ManageTheatres';
import ManageShows from './pages/admin/ManageShows';

function App() {
  return (
    <BrowserRouter>
      {/* Wrap the whole app in Auth and City context providers */}
      <AuthProvider>
        <CityProvider>
          {/* Global toast notification system */}
          <Toaster position="top-center" />

          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<AllMovies />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/events" element={<AllEvents />} />
            <Route path="/events/:id" element={<EventDetail />} />

            {/* ── Auth Routes ── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ── Protected Routes (user must be logged in) ── */}
            <Route path="/shows/:id/seats" element={
              <PrivateRoute><SeatSelection /></PrivateRoute>
            } />
            <Route path="/booking/confirm" element={
              <PrivateRoute><BookingConfirm /></PrivateRoute>
            } />
            <Route path="/my-bookings" element={
              <PrivateRoute><MyBookings /></PrivateRoute>
            } />

            {/* ── Admin Routes (user must be admin) ── */}
            <Route path="/admin" element={
              <AdminRoute><AdminLayout /></AdminRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="movies" element={<ManageMovies />} />
              <Route path="events" element={<ManageEvents />} />
              <Route path="theatres" element={<ManageTheatres />} />
              <Route path="shows" element={<ManageShows />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
