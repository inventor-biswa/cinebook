import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useCity } from '../context/CityContext';
import Layout from '../components/Layout';
import MovieCard from '../components/MovieCard';
import './Listing.css';

function AllEvents() {
    const { selectedCity } = useCity();
    const [events, setEvents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        API.get(`/events?city_id=${selectedCity.city_id}`)
            .then(res => { setEvents(res.data); setFiltered(res.data); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedCity]);

    useEffect(() => {
        let result = events;
        if (search) result = result.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
        if (category !== 'All') result = result.filter(e => e.category === category);
        setFiltered(result);
    }, [search, category, events]);

    const categories = ['All', ...new Set(events.map(e => e.category).filter(Boolean))];

    return (
        <Layout>
            <div className="container section">
                <h1 className="section-title">Events in {selectedCity.name}</h1>

                <div className="listing__filters">
                    <input
                        type="text"
                        placeholder="🔍 Search events..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="listing__search"
                    />
                    <div className="listing__genre-pills">
                        {categories.map(c => (
                            <button
                                key={c}
                                className={`listing__pill ${category === c ? 'listing__pill--active' : ''}`}
                                onClick={() => setCategory(c)}
                            >{c}</button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: '12px' }} />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid-4">
                        {filtered.map(e => (
                            <MovieCard key={e.event_id} id={e.event_id} title={e.title}
                                poster_url={e.poster_url} category={e.category} type="event" />
                        ))}
                    </div>
                ) : (
                    <div className="listing__empty">
                        <p>No events found{search ? ` for "${search}"` : ''}.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default AllEvents;
