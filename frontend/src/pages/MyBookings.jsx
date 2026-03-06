import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Layout from '../components/Layout';
import './MyBookings.css';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/bookings')
            .then(res => setBookings(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const statusClass = (status) => {
        if (status === 'confirmed') return 'badge-green';
        if (status === 'pending') return 'badge-gray';
        return 'badge-red';
    };

    return (
        <Layout>
            <div className="container section">
                <h1 className="section-title">My Bookings</h1>

                {loading ? (
                    <div className="my-bookings__list">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="my-bookings__empty">
                        <p>🎟️ No bookings yet!</p>
                        <p>Book a movie or event to see your tickets here.</p>
                        <Link to="/" className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }}>
                            Explore Movies & Events
                        </Link>
                    </div>
                ) : (
                    <div className="my-bookings__list">
                        {bookings.map(b => (
                            <div key={b.booking_id} className="booking-card">
                                <div className="booking-card__left">
                                    <p className="booking-card__title">{b.title || 'Event'}</p>
                                    <p className="booking-card__venue">{b.theatre_name}</p>
                                    <p className="booking-card__time">
                                        {new Date(b.show_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                        &nbsp;·&nbsp;{b.show_time?.slice(0, 5)}
                                    </p>
                                    <div className="booking-card__seats">
                                        {b.seat_labels?.split(',').map(s => (
                                            <span key={s} className="badge badge-gray">{s.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="booking-card__right">
                                    <span className={`badge ${statusClass(b.status)}`}>
                                        {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                                    </span>
                                    <p className="booking-card__amount">₹{b.total_amount}</p>
                                    <p className="booking-card__date">
                                        Booked on {new Date(b.booked_at).toLocaleDateString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default MyBookings;
