import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCity } from '../context/CityContext';
import Layout from '../components/Layout';
import MovieCard from '../components/MovieCard';
import './Home.css';

function Home() {
    const { selectedCity } = useCity();
    const navigate = useNavigate();
    const [trending, setTrending] = useState([]);
    const [movies, setMovies] = useState([]);
    const [events, setEvents] = useState([]);
    const [heroIndex, setHeroIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [trendingRes, moviesRes, eventsRes] = await Promise.all([
                    API.get('/movies/trending'),
                    API.get(`/movies?city_id=${selectedCity.city_id}`),
                    API.get(`/events?city_id=${selectedCity.city_id}`),
                ]);
                setTrending(trendingRes.data);
                setMovies(moviesRes.data);
                setEvents(eventsRes.data);
            } catch (err) {
                console.error('Home fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [selectedCity]);

    // Auto-advance hero carousel
    useEffect(() => {
        if (trending.length === 0) return;
        const interval = setInterval(() => {
            setHeroIndex(i => (i + 1) % trending.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [trending]);

    const hero = trending[heroIndex];

    const handleBookNow = () => {
        if (!hero) return;
        const path = hero.type === 'movie' ? `/movies/${hero.id}` : `/events/${hero.id}`;
        navigate(path);
    };

    return (
        <Layout>
            {/* ── HERO ── */}
            <section className="hero">
                {hero ? (
                    <>
                        <div
                            className="hero__bg"
                            style={{ backgroundImage: `url(${hero.poster_url})` }}
                        />
                        <div className="hero__overlay" />
                        <div className="container hero__content">
                            <span className={`badge ${hero.type === 'event' ? 'badge-gold' : 'badge-red'} hero__type-badge`}>
                                {hero.type === 'event' ? '🎤 Event' : '🎬 Movie'}
                            </span>
                            <h1 className="hero__title">{hero.title}</h1>
                            <div className="hero__actions">
                                <button className="btn btn-primary btn-lg" onClick={handleBookNow}>
                                    Book Now
                                </button>
                                <button className="btn btn-ghost btn-lg" onClick={handleBookNow}>
                                    More Info
                                </button>
                            </div>
                        </div>

                        {/* Dots */}
                        <div className="hero__dots">
                            {trending.map((_, i) => (
                                <button
                                    key={i}
                                    className={`hero__dot ${i === heroIndex ? 'hero__dot--active' : ''}`}
                                    onClick={() => setHeroIndex(i)}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="hero__skeleton" />
                )}
            </section>

            {/* ── NOW SHOWING ── */}
            <section className="section container">
                <div className="home__section-header">
                    <h2 className="section-title">Now Showing</h2>
                    <Link to="/movies" className="home__see-all">See All →</Link>
                </div>
                {loading ? (
                    <div className="grid-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: '12px' }} />
                        ))}
                    </div>
                ) : movies.length > 0 ? (
                    <div className="grid-4">
                        {movies.slice(0, 8).map(m => (
                            <MovieCard key={m.movie_id} id={m.movie_id} title={m.title}
                                poster_url={m.poster_url} genre={m.genre}
                                type="movie" status={m.status} />
                        ))}
                    </div>
                ) : (
                    <p className="home__empty">No movies available in {selectedCity.name} yet.</p>
                )}
            </section>

            {/* ── EVENTS ── */}
            <section className="section container">
                <div className="home__section-header">
                    <h2 className="section-title">Events Near You</h2>
                    <Link to="/events" className="home__see-all">See All →</Link>
                </div>
                {loading ? (
                    <div className="grid-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: '12px' }} />
                        ))}
                    </div>
                ) : events.length > 0 ? (
                    <div className="grid-4">
                        {events.slice(0, 4).map(e => (
                            <MovieCard key={e.event_id} id={e.event_id} title={e.title}
                                poster_url={e.poster_url} category={e.category} type="event" />
                        ))}
                    </div>
                ) : (
                    <p className="home__empty">No events in {selectedCity.name} yet. Check back soon!</p>
                )}
            </section>
        </Layout>
    );
}

export default Home;
