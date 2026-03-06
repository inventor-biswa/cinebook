import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCity } from '../context/CityContext';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import './MovieDetail.css';

function MovieDetail() {
    const { id } = useParams();
    const { selectedCity } = useCity();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovie = async () => {
            setLoading(true);
            try {
                const res = await API.get(`/movies/${id}?city_id=${selectedCity.city_id}`);
                setMovie(res.data);
                setShows(res.data.shows || []);
            } catch (err) {
                if (err.response?.status === 404) navigate('/404');
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id, selectedCity]);

    const handleBook = (showId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/shows/${showId}/seats`);
    };

    if (loading) return (
        <Layout>
            <div className="detail-skeleton container section">
                <div className="skeleton" style={{ height: '400px', borderRadius: '12px', marginBottom: '2rem' }} />
                <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '16px', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '16px', width: '80%' }} />
            </div>
        </Layout>
    );

    if (!movie) return null;

    // Group shows by date
    const showsByDate = shows.reduce((acc, show) => {
        const date = new Date(show.show_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        if (!acc[date]) acc[date] = [];
        acc[date].push(show);
        return acc;
    }, {});

    return (
        <Layout>
            {/* Backdrop Banner */}
            <div className="detail-banner">
                <div className="detail-banner__bg" style={{ backgroundImage: `url(${movie.poster_url})` }} />
                <div className="detail-banner__overlay" />
                <div className="container detail-banner__inner">
                    <img src={movie.poster_url} alt={movie.title} className="detail-banner__poster" />
                    <div className="detail-banner__info">
                        <span className="badge badge-red">🎬 Movie</span>
                        <h1 className="detail-banner__title">{movie.title}</h1>
                        <div className="detail-banner__meta">
                            {movie.genre && <span className="badge badge-gray">{movie.genre}</span>}
                            {movie.language && <span className="badge badge-gray">{movie.language}</span>}
                            <span className={`badge ${movie.status === 'now_showing' ? 'badge-green' : 'badge-gray'}`}>
                                {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                            </span>
                        </div>
                        {movie.description && <p className="detail-banner__desc">{movie.description}</p>}
                        {movie.cast_info && (
                            <p className="detail-banner__cast"><span>Cast:</span> {movie.cast_info}</p>
                        )}
                        {movie.trailer_url && (
                            <a href={movie.trailer_url} target="_blank" rel="noreferrer" className="btn btn-ghost">
                                ▶ Watch Trailer
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Shows Section */}
            <div className="container section">
                <h2 className="section-title">Book Tickets — {selectedCity.name}</h2>
                {shows.length === 0 ? (
                    <div className="detail-no-shows">
                        <p>😞 No shows available in <strong>{selectedCity.name}</strong> right now.</p>
                        <p>Try selecting a different city from the navbar.</p>
                    </div>
                ) : (
                    <div className="detail-shows">
                        {Object.entries(showsByDate).map(([date, dayShows]) => (
                            <div key={date} className="detail-shows__day">
                                <h3 className="detail-shows__date">{date}</h3>
                                <div className="detail-shows__slots">
                                    {dayShows.map(show => (
                                        <button
                                            key={show.show_id}
                                            className="detail-shows__slot"
                                            onClick={() => handleBook(show.show_id)}
                                        >
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

export default MovieDetail;
