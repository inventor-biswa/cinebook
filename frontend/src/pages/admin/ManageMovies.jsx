import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import './Admin.css';

const EMPTY = { title: '', genre: '', language: '', description: '', cast_info: '', poster_url: '', trailer_url: '', release_date: '', status: 'now_showing', is_trending: false };

function ManageMovies() {
    const [movies, setMovies] = useState([]);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null); // null = add, id = edit
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(false);

    const fetchMovies = () => API.get('/admin/movies').then(r => setMovies(r.data)).catch(() => { });
    useEffect(() => { fetchMovies(); }, []);

    const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
    const openEdit = (m) => { setForm({ ...m, is_trending: !!m.is_trending }); setEditing(m.movie_id); setModal(true); };
    const closeModal = () => { setModal(false); setEditing(null); };

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title) { toast.error('Title is required'); return; }
        setLoading(true);
        try {
            if (editing) {
                await API.put(`/admin/movies/${editing}`, form);
                toast.success('Movie updated!');
            } else {
                await API.post('/admin/movies', form);
                toast.success('Movie added!');
            }
            closeModal();
            fetchMovies();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try {
            await API.delete(`/admin/movies/${id}`);
            toast.success('Movie deleted.');
            setMovies(prev => prev.filter(m => m.movie_id !== id));
        } catch {
            toast.error('Delete failed.');
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Movies</h1>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Movie</button>
            </div>

            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th><th>Genre</th><th>Language</th>
                            <th>Status</th><th>Trending</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movies.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No movies yet. Add one!</td></tr>
                        ) : movies.map(m => (
                            <tr key={m.movie_id}>
                                <td>{m.title}</td>
                                <td>{m.genre || '—'}</td>
                                <td>{m.language || '—'}</td>
                                <td><span className={`badge ${m.status === 'now_showing' ? 'badge-green' : 'badge-gray'}`}>{m.status}</span></td>
                                <td>{m.is_trending ? '⭐ Yes' : '—'}</td>
                                <td>
                                    <div className="admin-table-actions">
                                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>Edit</button>
                                        <button className="btn btn-sm" style={{ background: 'rgba(229,9,20,0.15)', color: 'var(--accent)', border: '1px solid rgba(229,9,20,0.3)' }} onClick={() => handleDelete(m.movie_id, m.title)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modal && (
                <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h2>{editing ? 'Edit Movie' : 'Add Movie'}</h2>
                            <button className="admin-modal__close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Title */}
                            <div className="form-group">
                                <label>Title *</label>
                                <input name="title" type="text" value={form.title || ''} onChange={handleChange} />
                            </div>

                            {/* Genre dropdown */}
                            <div className="form-group">
                                <label>Genre</label>
                                <select name="genre" value={form.genre || ''} onChange={handleChange}>
                                    <option value="">Select genre…</option>
                                    {['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
                                        'Documentary', 'Drama', 'Fantasy', 'Horror', 'Musical',
                                        'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Sport'].map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                </select>
                            </div>

                            {/* Language dropdown */}
                            <div className="form-group">
                                <label>Language</label>
                                <select name="language" value={form.language || ''} onChange={handleChange}>
                                    <option value="">Select language…</option>
                                    {['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
                                        'Bengali', 'Marathi', 'Punjabi', 'Gujarati', 'Odia', 'Bhojpuri'].map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                </select>
                            </div>

                            {/* URL fields */}
                            {[
                                { name: 'poster_url', label: 'Poster URL', type: 'url' },
                                { name: 'trailer_url', label: 'Trailer URL', type: 'url' },
                                { name: 'release_date', label: 'Release Date', type: 'date' },
                            ].map(f => (
                                <div className="form-group" key={f.name}>
                                    <label>{f.label}</label>
                                    <input name={f.name} type={f.type} value={form[f.name] || ''} onChange={handleChange} />
                                </div>
                            ))}
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" rows={3} value={form.description || ''} onChange={handleChange} style={{ width: '100%', resize: 'vertical' }} />
                            </div>
                            <div className="form-group">
                                <label>Cast</label>
                                <input name="cast_info" value={form.cast_info || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={form.status} onChange={handleChange}>
                                    <option value="now_showing">Now Showing</option>
                                    <option value="coming_soon">Coming Soon</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <input type="checkbox" id="is_trending" name="is_trending" checked={!!form.is_trending} onChange={handleChange} style={{ width: 'auto' }} />
                                <label htmlFor="is_trending" style={{ marginBottom: 0 }}>Mark as Trending</label>
                            </div>
                            <div className="admin-modal__actions">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Movie'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageMovies;
