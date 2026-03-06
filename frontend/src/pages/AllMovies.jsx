import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useCity } from '../context/CityContext';
import Layout from '../components/Layout';
import MovieCard from '../components/MovieCard';
import './Listing.css';

function AllMovies() {
    const { selectedCity } = useCity();
    const [movies, setMovies] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [genre, setGenre] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        API.get(`/movies?city_id=${selectedCity.city_id}`)
            .then(res => { setMovies(res.data); setFiltered(res.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedCity]);

    useEffect(() => {
        let result = movies;
        if (search) result = result.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
        if (genre !== 'All') result = result.filter(m => m.genre === genre);
        setFiltered(result);
    }, [search, genre, movies]);

    const genres = ['All', ...new Set(movies.map(m => m.genre).filter(Boolean))];

    return (
        <Layout>
            <div className="container section">
                <h1 className="section-title">Movies in {selectedCity.name}</h1>

                {/* Filters */}
                <div className="listing__filters">
                    <input
                        type="text"
                        placeholder="🔍 Search movies..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="listing__search"
                    />
                    <div className="listing__genre-pills">
                        {genres.map(g => (
                            <button
                                key={g}
                                className={`listing__pill ${genre === g ? 'listing__pill--active' : ''}`}
                                onClick={() => setGenre(g)}
                            >{g}</button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid-4">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: '12px' }} />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid-4">
                        {filtered.map(m => (
                            <MovieCard key={m.movie_id} id={m.movie_id} title={m.title}
                                poster_url={m.poster_url} genre={m.genre}
                                type="movie" status={m.status} />
                        ))}
                    </div>
                ) : (
                    <div className="listing__empty">
                        <p>No movies found{search ? ` for "${search}"` : ''}.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default AllMovies;
