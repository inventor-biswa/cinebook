import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import API from '../api/axios';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const { selectedCity, changeCity } = useCity();
    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Fetch city list from backend for the dropdown
    useEffect(() => {
        API.get('/cities').then(res => setCities(res.data)).catch(() => { });
    }, []);

    // Add shadow when scrolled
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMenuOpen(false);
    };

    return (
        <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="container navbar__inner">

                {/* Logo */}
                <Link to="/" className="navbar__logo">
                    🎬 <span>Cine</span>Book
                </Link>

                {/* Navigation Links */}
                <nav className="navbar__links">
                    <Link to="/movies">Movies</Link>
                    <Link to="/events">Events</Link>
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="navbar__admin-link">Admin ⚡</Link>
                    )}
                </nav>

                {/* Right Controls */}
                <div className="navbar__right">
                    {/* City Selector */}
                    <div className="navbar__city">
                        <span className="navbar__city-icon">📍</span>
                        <select
                            value={selectedCity.city_id}
                            onChange={e => {
                                const city = cities.find(c => c.city_id === parseInt(e.target.value));
                                if (city) changeCity(city);
                            }}
                        >
                            {cities.map(c => (
                                <option key={c.city_id} value={c.city_id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* User Menu */}
                    {user ? (
                        <div className="navbar__user-menu">
                            <button
                                className="navbar__avatar"
                                onClick={() => setMenuOpen(o => !o)}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </button>
                            {menuOpen && (
                                <div className="navbar__dropdown">
                                    <p className="navbar__dropdown-name">{user.name}</p>
                                    <p className="navbar__dropdown-email">{user.email}</p>
                                    <hr />
                                    <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>🎟️ My Bookings</Link>
                                    <button onClick={handleLogout}>🚪 Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="navbar__auth-btns">
                            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
