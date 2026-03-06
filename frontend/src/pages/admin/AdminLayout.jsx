import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    const navItems = [
        { to: '/admin', label: '📊 Dashboard', end: true },
        { to: '/admin/movies', label: '🎬 Movies' },
        { to: '/admin/events', label: '🎤 Events' },
        { to: '/admin/theatres', label: '🏟️ Theatres' },
        { to: '/admin/shows', label: '📅 Shows' },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <Link to="/" className="admin-sidebar__logo">🎬 <span>Cine</span>Book</Link>
                <p className="admin-sidebar__role">Admin Panel</p>

                <nav className="admin-sidebar__nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <p className="admin-sidebar__user">{user?.name}</p>
                    <button className="admin-sidebar__logout" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                    <Link to="/" className="admin-sidebar__back">
                        ← Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
