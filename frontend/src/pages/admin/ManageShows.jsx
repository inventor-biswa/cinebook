import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';
import './ManageShows.css';

// One scheduler "row" = one theatre + multiple time slots
const newTheatreRow = () => ({ theatre_id: '', times: [''] });

function ManageShows() {
    const [shows, setShows] = useState([]);
    const [movies, setMovies] = useState([]);
    const [events, setEvents] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);

    // Shared fields
    const [showType, setShowType] = useState('movie');
    const [contentId, setContentId] = useState('');
    const [showDate, setShowDate] = useState('');
    const [price, setPrice] = useState('');

    // Dynamic rows: [ { theatre_id, times: ['09:00','11:00'] }, ... ]
    const [rows, setRows] = useState([newTheatreRow()]);

    const fetchData = () => Promise.all([
        API.get('/admin/shows').then(r => setShows(r.data)),
        API.get('/admin/movies').then(r => setMovies(r.data)),
        API.get('/admin/events').then(r => setEvents(r.data)),
        API.get('/admin/theatres').then(r => setTheatres(r.data)),
    ]).catch(() => { });

    useEffect(() => { fetchData(); }, []);

    const openModal = () => {
        setShowType('movie'); setContentId(''); setShowDate(''); setPrice('');
        setRows([newTheatreRow()]); setModal(true);
    };

    // ── Row manipulators ──────────────────────────────────────────────────────
    const setRowTheatre = (rowIdx, theatreId) => {
        setRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, theatre_id: theatreId } : r));
    };
    const setRowTime = (rowIdx, timeIdx, val) => {
        setRows(prev => prev.map((r, i) => {
            if (i !== rowIdx) return r;
            const times = [...r.times];
            times[timeIdx] = val;
            return { ...r, times };
        }));
    };
    const addTime = (rowIdx) => {
        setRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, times: [...r.times, ''] } : r));
    };
    const removeTime = (rowIdx, timeIdx) => {
        setRows(prev => prev.map((r, i) => {
            if (i !== rowIdx) return r;
            return { ...r, times: r.times.filter((_, ti) => ti !== timeIdx) };
        }));
    };
    const addTheatreRow = () => setRows(prev => [...prev, newTheatreRow()]);
    const removeTheatreRow = (rowIdx) => setRows(prev => prev.filter((_, i) => i !== rowIdx));

    // ── Submit: create one show per (theatre × time) combination ─────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contentId || !showDate || !price) { toast.error('Content, date and price are required.'); return; }
        // Validate all rows have a theatre and at least one time
        for (const row of rows) {
            if (!row.theatre_id) { toast.error('Please select a theatre for every row.'); return; }
            if (row.times.some(t => !t)) { toast.error('Please fill in all time slots.'); return; }
        }

        setLoading(true);
        let created = 0, failed = 0;

        // Build flat list of all (theatre, time) pairs
        const combos = rows.flatMap(row =>
            row.times.map(time => ({ theatre_id: parseInt(row.theatre_id), time }))
        );

        await Promise.allSettled(
            combos.map(({ theatre_id, time }) =>
                API.post('/admin/shows', {
                    theatre_id,
                    show_date: showDate,
                    show_time: time,
                    price: parseFloat(price),
                    ...(showType === 'movie'
                        ? { movie_id: parseInt(contentId) }
                        : { event_id: parseInt(contentId) }),
                }).then(() => created++).catch(() => failed++)
            )
        );

        setLoading(false);
        if (created > 0) toast.success(`✅ ${created} show${created > 1 ? 's' : ''} scheduled!`);
        if (failed > 0) toast.error(`${failed} show(s) failed (duplicate slot?).`);
        setModal(false);
        fetchData();
    };

    const handleDelete = (id) => setConfirmTarget({ id });
    const confirmDelete = async () => {
        const { id } = confirmTarget;
        setConfirmTarget(null);
        try { await API.delete(`/admin/shows/${id}`); toast.success('Show deleted.'); setShows(p => p.filter(s => s.show_id !== id)); }
        catch (err) { toast.error(err.response?.data?.message || 'Delete failed.'); }
    };

    const contentOptions = showType === 'movie' ? movies : events;

    return (
        <div>
            <div className="admin-header">
                <h1>Shows</h1>
                <button className="btn btn-primary" onClick={openModal}>+ Schedule Shows</button>
            </div>

            {/* Shows Table */}
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th><th>Theatre</th><th>Date</th>
                            <th>Time</th><th>Price</th><th>Seats Left</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shows.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No shows yet.</td></tr>
                        ) : shows.map(s => (
                            <tr key={s.show_id}>
                                <td>{s.title}</td>
                                <td>{s.theatre_name}</td>
                                <td>{new Date(s.show_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                <td>{s.show_time?.slice(0, 5)}</td>
                                <td style={{ color: 'var(--gold)' }}>₹{s.price}</td>
                                <td>
                                    <span className={`badge ${s.available_seats < 20 ? 'badge-red' : 'badge-green'}`}>
                                        {s.available_seats}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm"
                                        style={{ background: 'rgba(229,9,20,0.15)', color: 'var(--accent)', border: '1px solid rgba(229,9,20,0.3)' }}
                                        onClick={() => handleDelete(s.show_id)}
                                    >Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Batch Schedule Modal ── */}
            {modal && (
                <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="admin-modal admin-modal--wide">
                        <div className="admin-modal__header">
                            <h2>Schedule Shows</h2>
                            <button className="admin-modal__close" onClick={() => setModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Top row: type + content + date + price */}
                            <div className="show-form-top">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select value={showType} onChange={e => { setShowType(e.target.value); setContentId(''); }}>
                                        <option value="movie">Movie</option>
                                        <option value="event">Event</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>{showType === 'movie' ? 'Movie' : 'Event'} *</label>
                                    <select value={contentId} onChange={e => setContentId(e.target.value)}>
                                        <option value="">Select…</option>
                                        {contentOptions.map(c => (
                                            <option key={c.movie_id || c.event_id} value={c.movie_id || c.event_id}>
                                                {c.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input type="date" value={showDate} onChange={e => setShowDate(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
                                </div>
                            </div>

                            {/* Theatre rows */}
                            <div className="show-form-label">
                                <span>Theatres & Time Slots</span>
                                <button type="button" className="btn btn-ghost btn-sm" onClick={addTheatreRow}>
                                    + Add Theatre
                                </button>
                            </div>

                            <div className="show-theatre-rows">
                                {rows.map((row, rowIdx) => (
                                    <div key={rowIdx} className="show-theatre-row">
                                        {/* Theatre selector */}
                                        <div className="show-theatre-row__head">
                                            <select
                                                value={row.theatre_id}
                                                onChange={e => setRowTheatre(rowIdx, e.target.value)}
                                                className="show-theatre-select"
                                            >
                                                <option value="">Select theatre…</option>
                                                {theatres.map(t => (
                                                    <option key={t.theatre_id} value={t.theatre_id}>{t.name}</option>
                                                ))}
                                            </select>
                                            {rows.length > 1 && (
                                                <button type="button" className="show-remove-row" onClick={() => removeTheatreRow(rowIdx)}>✕</button>
                                            )}
                                        </div>

                                        {/* Time slots */}
                                        <div className="show-time-slots">
                                            {row.times.map((t, tIdx) => (
                                                <div key={tIdx} className="show-time-chip">
                                                    <input
                                                        type="time"
                                                        value={t}
                                                        onChange={e => setRowTime(rowIdx, tIdx, e.target.value)}
                                                    />
                                                    {row.times.length > 1 && (
                                                        <button type="button" onClick={() => removeTime(rowIdx, tIdx)}>✕</button>
                                                    )}
                                                </div>
                                            ))}
                                            <button type="button" className="show-add-time" onClick={() => addTime(rowIdx)}>
                                                + Add Time
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary count */}
                            <p className="show-form-summary">
                                Will create <strong>{rows.reduce((n, r) => n + r.times.length, 0)}</strong> show(s) with 100 auto-generated seats each.
                            </p>

                            <div className="admin-modal__actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Scheduling…' : 'Schedule All Shows'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={!!confirmTarget}
                title="Delete this show?"
                message="All seat reservation data for this show will be permanently removed."
                confirmLabel="Yes, Delete"
                danger
                onCancel={() => setConfirmTarget(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}

export default ManageShows;
