import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import Layout from '../components/Layout';
import MovieCard from '../components/MovieCard';
import './Home.css';

// ── Defined OUTSIDE Home so React never remounts it on re-render (prevents scroll reset) ──
const MovieRow = ({ items, type = 'movie' }) => (
    <div className="movie-row">
        {items.map(item => (
            <MovieCard
                key={item.movie_id || item.event_id || item.id}
                id={item.movie_id || item.event_id || item.id}
                title={item.title}
                poster_url={item.poster_url}
                genre={item.genre || item.category}
                type={type}
                status={item.status}
            />
        ))}
    </div>
);

function Home() {
    const { user } = useAuth();
    const { selectedCity } = useCity();
    const navigate = useNavigate();

    const [trending, setTrending]       = useState([]);
    const [nowShowing, setNowShowing]   = useState([]);
    const [comingSoon, setComingSoon]   = useState([]);
    const [events, setEvents]           = useState([]);
    const [offers, setOffers]           = useState([]);
    const [cities, setCities]           = useState([]);
    const [recommendations, setRecs]    = useState([]);
    const [heroIndex, setHeroIndex]     = useState(0);
    const [loading, setLoading]         = useState(true);
    const [activeGenre, setActiveGenre] = useState('All');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const calls = [
                    API.get('/movies/trending'),
                    API.get('/movies?status=now_showing'),
                    API.get('/movies?status=coming_soon'),
                    API.get('/events'),
                    API.get('/offers/active'),
                    API.get('/cities'),
                ];
                if (user) calls.push(API.get('/recommendations'));

                const results = await Promise.allSettled(calls);
                if (results[0].status === 'fulfilled') setTrending(results[0].value.data);
                if (results[1].status === 'fulfilled') setNowShowing(results[1].value.data);
                if (results[2].status === 'fulfilled') setComingSoon(results[2].value.data);
                if (results[3].status === 'fulfilled') setEvents(results[3].value.data);
                if (results[4].status === 'fulfilled') setOffers(results[4].value.data);
                if (results[5].status === 'fulfilled') setCities(results[5].value.data);
                if (user && results[6]?.status === 'fulfilled') setRecs(results[6].value.data);
            } catch (err) {
                console.error('Home fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user]);

    // Auto-advance hero
    useEffect(() => {
        if (trending.length === 0) return;
        const interval = setInterval(() => setHeroIndex(i => (i + 1) % trending.length), 5000);
        return () => clearInterval(interval);
    }, [trending]);

    const hero = trending[heroIndex];

    // Unique genres from now showing
    const genres = ['All', ...new Set(nowShowing.map(m => m.genre).filter(Boolean).flatMap(g => g.split(',').map(s => s.trim())))];
    const filteredMovies = activeGenre === 'All'
        ? nowShowing
        : nowShowing.filter(m => m.genre && m.genre.toLowerCase().includes(activeGenre.toLowerCase()));

    const handleHeroClick = () => {
        if (!hero) return;
        navigate(hero.type === 'movie' ? `/movies/${hero.id}` : `/events/${hero.id}`);
    };

    return (
        <Layout>
            {/* ── HERO ────────────────────────────────────────────── */}
            <section className="hero">
                {hero ? (
                    <>
                        <div className="hero__bg" style={{ backgroundImage: `url(${hero.poster_url})` }} />
                        <div className="hero__overlay" />
                        <div className="container hero__content">
                            <span className={`badge ${hero.type === 'event' ? 'badge-gold' : 'badge-purple'} hero__type-badge`}>
                                {hero.type === 'event' ? '🎤 Event' : '🎬 Movie'}
                            </span>
                            <h1 className="hero__title">{hero.title}</h1>
                            <div className="hero__actions">
                                <button className="btn btn-primary btn-lg" onClick={handleHeroClick}>Book Now</button>
                                <button className="btn btn-ghost btn-lg" onClick={handleHeroClick}>More Info</button>
                            </div>
                        </div>
                        <div className="hero__dots">
                            {trending.map((_, i) => (
                                <button key={i} className={`hero__dot ${i === heroIndex ? 'hero__dot--active' : ''}`} onClick={() => setHeroIndex(i)} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="hero__skeleton skeleton" />
                )}
            </section>

            {/* ── OFFERS BANNER ───────────────────────────────────── */}
            {offers.length > 0 && (
                <section className="offers-banner container">
                    <div className="offers-banner__scroll">
                        {offers.map(o => (
                            <div key={o.offer_id} className="offer-pill">
                                🎁 <strong>{o.code}</strong> — {o.title}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── BROWSE CATEGORIES ───────────────────────────────── */}
            <section className="section container">
                <h2 className="section-title">Browse Categories</h2>
                <div className="category-cards">
                    <Link to="/movies" className="category-card purple">🎬 Movies</Link>
                    <Link to="/events?cat=theater" className="category-card pink">🎭 Theater</Link>
                    <Link to="/events?cat=concerts" className="category-card blue">🎵 Concerts</Link>
                    <Link to="/events?cat=comedy" className="category-card orange">😂 Comedy</Link>
                </div>
            </section>

            {/* ── TRENDING NOW ────────────────────────────────────── */}
            {trending.length > 0 && (
                <section className="section container">
                    <div className="home__section-header">
                        <h2 className="section-title">🔥 Trending Now</h2>
                        <Link to="/movies" className="home__see-all">See All →</Link>
                    </div>
                    <MovieRow items={trending} />
                </section>
            )}

            {/* ── NOW SHOWING ─────────────────────────────────────── */}
            <section className="section container">
                <div className="home__section-header">
                    <h2 className="section-title">🎬 Now Showing</h2>
                    <Link to="/movies" className="home__see-all">See All →</Link>
                </div>

                {/* Genre Filter Pills */}
                {genres.length > 1 && (
                    <div className="genre-pills">
                        {genres.slice(0, 10).map(g => (
                            <button
                                key={g}
                                onClick={() => setActiveGenre(g)}
                                className={`genre-pill ${activeGenre === g ? 'genre-pill--active' : ''}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="movie-row">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="skeleton movie-card-skeleton" />
                        ))}
                    </div>
                ) : filteredMovies.length > 0 ? (
                    <MovieRow items={filteredMovies} />
                ) : (
                    <p className="home__empty">No movies found for this genre.</p>
                )}
            </section>

            {/* ── COMING SOON ─────────────────────────────────────── */}
            {comingSoon.length > 0 && (
                <section className="section container">
                    <div className="home__section-header">
                        <h2 className="section-title">🔜 Coming Soon</h2>
                        <Link to="/movies?status=coming_soon" className="home__see-all">See All →</Link>
                    </div>
                    <MovieRow items={comingSoon} />
                </section>
            )}

            {/* ── AI PICKS (logged in only) ────────────────────────── */}
            {user && recommendations.length > 0 && (
                <section className="section container">
                    <div className="home__section-header">
                        <h2 className="section-title">🤖 Recommended For You</h2>
                    </div>
                    <MovieRow items={recommendations} />
                </section>
            )}

            {/* ── EVENTS NEAR YOU ─────────────────────────────────── */}
            {events.length > 0 && (
                <section className="section container">
                    <div className="home__section-header">
                        <h2 className="section-title">🎤 Events</h2>
                        <Link to="/events" className="home__see-all">See All →</Link>
                    </div>
                    <MovieRow items={events} type="event" />
                </section>
            )}

            {/* ── EXPLORE BY CITY ─────────────────────────────────── */}
            {cities.length > 0 && (
                <section className="section container">
                    <h2 className="section-title">🏙️ Explore by City</h2>
                    <div className="city-grid">
                        {cities.map(c => (
                            <Link
                                key={c.city_id}
                                to={`/movies?city=${c.city_id}`}
                                className={`city-card ${selectedCity?.city_id === c.city_id ? 'city-card--active' : ''}`}
                            >
                                <span className="city-card__name">{c.name}</span>
                                <span className="city-card__arrow">→</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </Layout>
    );
}

export default Home;
