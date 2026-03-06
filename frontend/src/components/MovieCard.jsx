import { Link } from 'react-router-dom';
import './MovieCard.css';

// ─── MOVIE CARD ────────────────────────────────────────────────────────────────
// Reusable card component for both movies and events.
// Props:
//   id         → movie_id or event_id
//   title      → movie/event title
//   poster_url → poster image URL
//   genre      → genre string (movies only)
//   type       → "movie" | "event"
//   status     → "now_showing" | "coming_soon" (movies only)
//   category   → e.g. "Music", "Comedy" (events only)

function MovieCard({ id, title, poster_url, genre, type = 'movie', status, category }) {
    const href = type === 'movie' ? `/movies/${id}` : `/events/${id}`;

    const badgeLabel = type === 'event'
        ? category
        : status === 'coming_soon' ? 'Coming Soon' : 'Now Showing';

    const badgeClass = type === 'event'
        ? 'badge badge-gold'
        : status === 'coming_soon' ? 'badge badge-gray' : 'badge badge-green';

    return (
        <Link to={href} className="movie-card">
            <div className="movie-card__poster-wrap">
                <img
                    src={poster_url || 'https://placehold.co/300x450/1a1a28/9999bb?text=No+Image'}
                    alt={title}
                    className="movie-card__poster"
                    loading="lazy"
                />
                <div className="movie-card__overlay">
                    <span className="movie-card__book-btn">
                        {type === 'event' ? '🎤 Get Tickets' : '🎬 Book Now'}
                    </span>
                </div>
                <span className={`movie-card__badge ${badgeClass}`}>{badgeLabel}</span>
            </div>

            <div className="movie-card__info">
                <h3 className="movie-card__title">{title}</h3>
                {(genre || category) && (
                    <p className="movie-card__genre">{genre || category}</p>
                )}
            </div>
        </Link>
    );
}

export default MovieCard;
