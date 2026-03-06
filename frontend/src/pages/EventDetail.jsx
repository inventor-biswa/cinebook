import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import './MovieDetail.css'; /* reuse the same detail styles */

function EventDetail() {
    const { id } = useParams();
    const { selectedCity } = useCity();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            try {
                const res = await API.get(`/events/${id}?city_id=${selectedCity.city_id}`);
                setEvent(res.data);
                setShows(res.data.shows || []);
            } catch (err) {
                if (err.response?.status === 404) navigate('/404');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, selectedCity]);

    const handleBook = (showId) => {
        if (!user) { navigate('/login'); return; }
        navigate(`/shows/${showId}/seats`);
    };

    if (loading) return (
        <Layout>
            <div className="detail-skeleton container section">
                <div className="skeleton" style={{ height: '400px', borderRadius: '12px', marginBottom: '2rem' }} />
                <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '1rem' }} />
            </div>
        </Layout>
    );

    if (!event) return null;

    const showsByDate = shows.reduce((acc, show) => {
        const date = new Date(show.show_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(show);
        return acc;
    }, {});

    return (
        <Layout>
            <div className="detail-banner">
                <div className="detail-banner__bg" style={{ backgroundImage: `url(${event.poster_url})` }} />
                <div className="detail-banner__overlay" />
                <div className="container detail-banner__inner">
                    <img src={event.poster_url} alt={event.title} className="detail-banner__poster" />
                    <div className="detail-banner__info">
                        <span className="badge badge-gold">🎤 Event</span>
                        <h1 className="detail-banner__title">{event.title}</h1>
                        <div className="detail-banner__meta">
                            {event.category && <span className="badge badge-gray">{event.category}</span>}
                        </div>
                        {event.description && <p className="detail-banner__desc">{event.description}</p>}
                        {event.trailer_url && (
                            <a href={event.trailer_url} target="_blank" rel="noreferrer" className="btn btn-ghost">
                                ▶ Watch Promo
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="container section">
                <h2 className="section-title">Get Tickets — {selectedCity.name}</h2>
                {shows.length === 0 ? (
                    <div className="detail-no-shows">
                        <p>😞 No shows for this event in <strong>{selectedCity.name}</strong>.</p>
                    </div>
                ) : (
                    <div className="detail-shows">
                        {Object.entries(showsByDate).map(([date, dayShows]) => (
                            <div key={date} className="detail-shows__day">
                                <h3 className="detail-shows__date">{date}</h3>
                                <div className="detail-shows__slots">
                                    {dayShows.map(show => (
                                        <button key={show.show_id} className="detail-shows__slot"
                                            onClick={() => handleBook(show.show_id)}>
                                            <span className="slot__time">{show.show_time.slice(0, 5)}</span>
                                            <span className="slot__theatre">{show.theatre_name}</span>
                                            <span className="slot__price">₹{show.price}</span>
                                            <span className={`slot__seats ${show.available_seats < 20 ? 'slot__seats--low' : ''}`}>
                                                {show.available_seats} seats left
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default EventDetail;
