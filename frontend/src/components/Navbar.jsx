import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { ThemeContext } from '../context/ThemeContext';
import API from '../api/axios';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const { selectedCity, changeCity } = useCity();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        API.get('/cities').then(res => setCities(res.data)).catch(() => {});
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMenuOpen(false);
        setMobileOpen(false);
    };

    return (
        <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="container navbar__inner">

                {/* Logo — text with colored styling matching static site */}
                <Link to="/" className="navbar__logo">
                    <span className="logo-qwik">Qwik</span>
                    <span className="logo-show">Show</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="navbar__links">
                    <Link to="/">Home</Link>
                    <Link to="/movies">Movies</Link>
                    <Link to="/events">Events</Link>
                    <Link to="/offers">Offers</Link>
                    <Link to="/support">Support</Link>
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
                            value={selectedCity?.city_id || ''}
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

                    {/* Theme Toggle */}
                    <button
                        className="navbar__theme-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

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
                                    {user.reward_points !== undefined && (
                                        <p className="navbar__points">🏆 {user.reward_points || 0} pts</p>
                                    )}
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

                    {/* Mobile Hamburger */}
                    <button className="navbar__hamburger" onClick={() => setMobileOpen(o => !o)}>
                        {mobileOpen ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <>
                    <div className="navbar__overlay" onClick={() => setMobileOpen(false)} />
                    <div className="navbar__drawer">
                        <div className="drawer__header">
                            <span className="logo-qwik">Qwik</span><span className="logo-show">Show</span>
                            <button onClick={() => setMobileOpen(false)}>✕</button>
                        </div>
                        <nav className="drawer__links">
                            <Link to="/" onClick={() => setMobileOpen(false)}>🏠 Home</Link>
                            <Link to="/movies" onClick={() => setMobileOpen(false)}>🎬 Movies</Link>
                            <Link to="/events" onClick={() => setMobileOpen(false)}>🎤 Events</Link>
                            <Link to="/offers" onClick={() => setMobileOpen(false)}>🎁 Offers</Link>
                            <Link to="/support" onClick={() => setMobileOpen(false)}>🎧 Support</Link>
                            {user ? (
                                <>
                                    <Link to="/my-bookings" onClick={() => setMobileOpen(false)}>🎟️ My Bookings</Link>
                                    {user?.role === 'admin' && (
                                        <Link to="/admin" onClick={() => setMobileOpen(false)}>⚡ Admin</Link>
                                    )}
                                    <button onClick={handleLogout} className="drawer__logout">🚪 Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                                    <Link to="/register" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                                </>
                            )}
                        </nav>
                    </div>
                </>
            )}
        </header>
    );
}

export default Navbar;
