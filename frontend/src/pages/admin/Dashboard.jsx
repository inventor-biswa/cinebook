import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import './Admin.css';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            API.get('/admin/reports/stats'),
            API.get('/admin/reports/recent'),
        ]).then(([statsRes, recentRes]) => {
            setStats(statsRes.data);
            setRecent(recentRes.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const cards = stats ? [
        { label: 'Total Revenue', value: `₹${Number(stats.revenue || 0).toLocaleString('en-IN')}`, variant: 'gold' },
        { label: 'Total Bookings', value: stats.bookings, variant: 'accent' },
        { label: 'Registered Users', value: stats.users, variant: 'green' },
        { label: 'Movies', value: stats.movies, variant: '' },
        { label: 'Events', value: stats.events, variant: '' },
    ] : [];

    return (
        <div>
            <div className="admin-header">
                <h1>Dashboard</h1>
                <span className="badge badge-gold">Admin</span>
            </div>

            {/* Stat Cards */}
            {loading ? (
                <div className="admin-stats">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
                    ))}
                </div>
            ) : (
                <div className="admin-stats">
                    {cards.map(c => (
                        <div key={c.label} className={`admin-stat-card ${c.variant ? `admin-stat-card--${c.variant}` : ''}`}>
                            <p className="admin-stat-card__value">{c.value}</p>
                            <p className="admin-stat-card__label">{c.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Links */}
            <div className="admin-header" style={{ marginBottom: 'var(--space-lg)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '2px', fontSize: '1.3rem' }}>Quick Actions</h2>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-2xl)' }}>
                <Link to="/admin/movies" className="btn btn-ghost">+ Add Movie</Link>
                <Link to="/admin/events" className="btn btn-ghost">+ Add Event</Link>
                <Link to="/admin/theatres" className="btn btn-ghost">+ Add Theatre</Link>
                <Link to="/admin/shows" className="btn btn-ghost">+ Schedule Show</Link>
            </div>

            {/* Recent Bookings */}
            <div className="admin-header">
                <h2 style={{ fontFamily: 'var(--font-display)', letterSpacing: '2px', fontSize: '1.3rem' }}>Recent Bookings</h2>
            </div>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User</th>
                            <th>Show</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recent.length === 0 && !loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bookings yet.</td></tr>
                        ) : recent.map(b => (
                            <tr key={b.booking_id}>
                                <td>#{b.booking_id}</td>
                                <td>{b.user_name}</td>
                                <td>{b.title}</td>
                                <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{b.total_amount}</td>
                                <td>{new Date(b.booked_at).toLocaleDateString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;
