import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

const EMPTY = { title: '', genre: '', language: '', description: '', cast_info: '', poster_url: '', trailer_url: '', release_date: '', status: 'now_showing', is_trending: false };

function ManageMovies() {
    const [movies, setMovies] = useState([]);
    const [modal, setModal] = useState(false);
    const [bulkModal, setBulkModal] = useState(false);
    const [bulkTitles, setBulkTitles] = useState('');
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkResult, setBulkResult] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null); // { id, title }

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
        setConfirmTarget({ id, title });
    };

    const confirmDelete = async () => {
        const { id } = confirmTarget;
        setConfirmTarget(null);
        try {
            await API.delete(`/admin/movies/${id}`);
            toast.success('Movie deleted.');
            setMovies(prev => prev.filter(m => m.movie_id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed.');
        }
    };

    const handleBulkImport = async () => {
        const titles = bulkTitles.split('\n').map(t => t.trim()).filter(Boolean);
        if (titles.length === 0) return toast.error('Enter at least one title.');
        setBulkLoading(true);
        setBulkResult(null);
        try {
            const res = await API.post('/admin/movies/bulk-import', { titles });
            setBulkResult(res.data);
            fetchMovies();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Bulk import failed.');
        } finally {
            setBulkLoading(false);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Movies</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-ghost" onClick={() => { setBulkModal(true); setBulkResult(null); setBulkTitles(''); }}>📥 Bulk Import</button>
                    <button className="btn btn-primary" onClick={openAdd}>+ Add Movie</button>
                </div>
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
                                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                                    <input name="title" type="text" value={form.title || ''} onChange={handleChange} style={{ flex: 1 }} />
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-ghost" 
                                        onClick={async () => {
                                            if (!form.title) return toast.error('Enter title first!');
                                            try {
                                                setLoading(true);
                                                const res = await API.post('/admin/movies/fetch-meta', { title: form.title });
                                                const firstGenre = res.data.genre.split(', ')[0];
                                                setForm(f => ({ ...f, ...res.data, genre: firstGenre }));
                                                toast.success('Metadata fetched from TMDb!');
                                            } catch (err) {
                                                const msg = err.response?.data?.message || '';
                                                if (msg.includes('network') || msg.includes('VPN') || msg.includes('unreachable') || err.code === 'ERR_NETWORK') {
                                                    toast.error('📶 TMDb blocked on your network. Switch to office WiFi, or use a VPN and retry.', { duration: 5000 });
                                                } else {
                                                    toast.error(msg || 'Meta fetch failed. Try again.');
                                                }
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? '⏳ Fetching…' : '✨ Fetch'}
                                    </button>
                                </div>
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
                                <input type="checkbox" id="is_trending" name="is_trending" checked={!!form.is_trending} onChange={handleChange} style={{ display: 'none' }} />
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, is_trending: !f.is_trending }))}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        background: form.is_trending
                                            ? 'rgba(255,204,0,0.15)'
                                            : 'var(--bg-elevated)',
                                        border: form.is_trending
                                            ? '1px solid rgba(255,204,0,0.5)'
                                            : '1px solid var(--border-strong)',
                                        borderRadius: 'var(--radius-full)',
                                        padding: '8px 18px',
                                        color: form.is_trending ? 'var(--gold)' : 'var(--text-muted)',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.25s ease',
                                        userSelect: 'none',
                                    }}
                                >
                                    {/* Toggle pill */}
                                    <span style={{
                                        display: 'inline-block',
                                        width: '36px',
                                        height: '20px',
                                        borderRadius: '999px',
                                        background: form.is_trending ? 'var(--gold)' : 'var(--border-strong)',
                                        position: 'relative',
                                        transition: 'background 0.25s ease',
                                        flexShrink: 0,
                                    }}>
                                        <span style={{
                                            position: 'absolute',
                                            top: '3px',
                                            left: form.is_trending ? '19px' : '3px',
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            transition: 'left 0.25s ease',
                                        }} />
                                    </span>
                                    {form.is_trending ? '⭐ Trending ON' : 'Trending OFF'}
                                </button>
                            </div>
                            <div className="admin-modal__actions">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Movie'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Import Modal */}
            {bulkModal && (
                <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setBulkModal(false)}>
                    <div className="admin-modal" style={{ maxWidth: '560px' }}>
                        <div className="admin-modal__header">
                            <h2>📥 Bulk Import from TMDb</h2>
                            <button className="admin-modal__close" onClick={() => setBulkModal(false)}>✕</button>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '12px' }}>
                            Enter one movie title per line (max 20). Existing movies are automatically skipped.
                        </p>
                        <textarea
                            rows={8}
                            style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.9rem' }}
                            placeholder={'Inception\nInterstellar\nOppenheimer\nDune'}
                            value={bulkTitles}
                            onChange={e => setBulkTitles(e.target.value)}
                        />
                        <div className="admin-modal__actions" style={{ marginTop: '16px' }}>
                            <button className="btn btn-ghost" onClick={() => setBulkModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleBulkImport} disabled={bulkLoading}>
                                {bulkLoading ? '⏳ Importing…' : '✨ Import All'}
                            </button>
                        </div>
                        {bulkResult && (
                            <div style={{ marginTop: '20px', fontSize: '0.875rem' }}>
                                <p style={{ color: 'var(--success)', fontWeight: 600, marginBottom: '8px' }}>
                                    {bulkResult.message}
                                </p>
                                {bulkResult.imported.length > 0 && (
                                    <div style={{ marginBottom: '6px' }}>
                                        <strong style={{ color: 'var(--success)' }}>✅ Imported:</strong>
                                        <ul style={{ margin: '4px 0 0 16px' }}>{bulkResult.imported.map(t => <li key={t}>{t}</li>)}</ul>
                                    </div>
                                )}
                                {bulkResult.skipped.length > 0 && (
                                    <div style={{ marginBottom: '6px' }}>
                                        <strong style={{ color: 'var(--gold)' }}>⏭️ Skipped:</strong>
                                        <ul style={{ margin: '4px 0 0 16px' }}>{bulkResult.skipped.map(s => <li key={s.title}>{s.title} — {s.reason}</li>)}</ul>
                                    </div>
                                )}
                                {bulkResult.failed.length > 0 && (
                                    <div>
                                        <strong style={{ color: 'var(--error)' }}>❌ Failed:</strong>
                                        <ul style={{ margin: '4px 0 0 16px' }}>{bulkResult.failed.map(f => <li key={f.title}>{f.title} — {f.reason}</li>)}</ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={!!confirmTarget}
                title={`Delete "${confirmTarget?.title}"?`}
                message="This action cannot be undone. The movie will be permanently removed."
                confirmLabel="Yes, Delete"
                danger
                onCancel={() => setConfirmTarget(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}

export default ManageMovies;
