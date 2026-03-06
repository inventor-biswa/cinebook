import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import './Admin.css';

const EMPTY = { show_type: 'movie', content_id: '', theatre_id: '', show_date: '', show_time: '', price: '' };

function ManageShows() {
    const [shows, setShows] = useState([]);
    const [movies, setMovies] = useState([]);
    const [events, setEvents] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(false);

    const fetchData = () => Promise.all([
        API.get('/admin/shows').then(r => setShows(r.data)),
        API.get('/admin/movies').then(r => setMovies(r.data)),
        API.get('/admin/events').then(r => setEvents(r.data)),
        API.get('/admin/theatres').then(r => setTheatres(r.data)),
    ]).catch(() => { });

    useEffect(() => { fetchData(); }, []);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { show_type, content_id, theatre_id, show_date, show_time, price } = form;
        if (!content_id || !theatre_id || !show_date || !show_time || !price) {
            toast.error('All fields are required.'); return;
        }
        setLoading(true);
        try {
            const payload = {
                theatre_id: parseInt(theatre_id),
                show_date, show_time,
                price: parseFloat(price),
                ...(show_type === 'movie'
                    ? { movie_id: parseInt(content_id) }
                    : { event_id: parseInt(content_id) }),
            };
            await API.post('/admin/shows', payload);
            toast.success('Show scheduled! Seats auto-generated ✅');
            setModal(false); setForm(EMPTY); fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this show? All seat data will be removed.')) return;
        try { await API.delete(`/admin/shows/${id}`); toast.success('Show deleted.'); setShows(p => p.filter(s => s.show_id !== id)); }
        catch { toast.error('Delete failed.'); }
    };

    const contentOptions = form.show_type === 'movie' ? movies : events;

    return (
        <div>
            <div className="admin-header">
                <h1>Shows</h1>
                <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}>+ Schedule Show</button>
            </div>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Title</th><th>Theatre</th><th>Date</th><th>Time</th><th>Price</th><th>Seats Left</th><th>Actions</th></tr></thead>
                    <tbody>
                        {shows.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No shows scheduled.</td></tr>
                        ) : shows.map(s => (
                            <tr key={s.show_id}>
                                <td>{s.title}</td>
                                <td>{s.theatre_name}</td>
                                <td>{new Date(s.show_date).toLocaleDateString('en-IN')}</td>
                                <td>{s.show_time?.slice(0, 5)}</td>
                                <td style={{ color: 'var(--gold)' }}>₹{s.price}</td>
                                <td>
                                    <span className={`badge ${s.available_seats < 20 ? 'badge-red' : 'badge-green'}`}>
                                        {s.available_seats}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-sm" style={{ background: 'rgba(229,9,20,0.15)', color: 'var(--accent)', border: '1px solid rgba(229,9,20,0.3)' }} onClick={() => handleDelete(s.show_id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal && (
                <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h2>Schedule a Show</h2>
                            <button className="admin-modal__close" onClick={() => setModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Show Type</label>
                                <select name="show_type" value={form.show_type} onChange={handleChange}>
                                    <option value="movie">Movie</option>
                                    <option value="event">Event</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{form.show_type === 'movie' ? 'Movie' : 'Event'} *</label>
                                <select name="content_id" value={form.content_id} onChange={handleChange}>
                                    <option value="">Select…</option>
                                    {contentOptions.map(c => (
                                        <option key={c.movie_id || c.event_id} value={c.movie_id || c.event_id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Theatre *</label>
                                <select name="theatre_id" value={form.theatre_id} onChange={handleChange}>
                                    <option value="">Select…</option>
                                    {theatres.map(t => <option key={t.theatre_id} value={t.theatre_id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div className="form-group"><label>Date *</label><input name="show_date" type="date" value={form.show_date} onChange={handleChange} /></div>
                                <div className="form-group"><label>Time *</label><input name="show_time" type="time" value={form.show_time} onChange={handleChange} /></div>
                            </div>
                            <div className="form-group"><label>Price (₹) *</label><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} /></div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                                ℹ️ Saving will auto-generate 100 seats (A1–J10) in the database.
                            </p>
                            <div className="admin-modal__actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Scheduling…' : 'Schedule Show'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageShows;
