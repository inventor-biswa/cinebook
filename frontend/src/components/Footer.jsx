import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="container footer__inner">
                <div className="footer__brand">
                    <p className="footer__logo">
                        <span style={{ color: 'var(--primary)' }}>Qwik</span>Show
                    </p>
                    <p className="footer__tagline">Your ultimate movie & event booking platform.</p>
                </div>

                <div className="footer__links">
                    <div>
                        <h4>Explore</h4>
                        <Link to="/movies">Movies</Link>
                        <Link to="/events">Events</Link>
                        <Link to="/support">Support</Link>
                    </div>
                    <div>
                        <h4>Account</h4>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Sign Up</Link>
                        <Link to="/my-bookings">My Bookings</Link>
                    </div>
                </div>
            </div>
            <div className="footer__bottom">
                <p>© {new Date().getFullYear()} QwikShow. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
