import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import './Admin.css';

const EMPTY = { title: '', category: '', description: '', poster_url: '', trailer_url: '' };

function ManageEvents() {
    const [events, setEvents] = useState([]);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(false);

    const fetchEvents = () => API.get('/admin/events').then(r => setEvents(r.data)).catch(() => { });
    useEffect(() => { fetchEvents(); }, []);

    const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
    const openEdit = (ev) => { setForm(ev); setEditing(ev.event_id); setModal(true); };
    const closeModal = () => { setModal(false); setEditing(null); };
    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title) { toast.error('Title required'); return; }
        setLoading(true);
        try {
            editing ? await API.put(`/admin/events/${editing}`, form) : await API.post('/admin/events', form);
            toast.success(editing ? 'Event updated!' : 'Event added!');
            closeModal(); fetchEvents();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try { await API.delete(`/admin/events/${id}`); toast.success('Event deleted.'); setEvents(p => p.filter(e => e.event_id !== id)); }
        catch { toast.error('Delete failed.'); }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Events</h1>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Event</button>
            </div>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Title</th><th>Category</th><th>Actions</th></tr></thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No events yet.</td></tr>
                        ) : events.map(ev => (
                            <tr key={ev.event_id}>
                                <td>{ev.title}</td>
                                <td><span className="badge badge-gold">{ev.category || '—'}</span></td>
                                <td><div className="admin-table-actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ev)}>Edit</button>
                                    <button className="btn btn-sm" style={{ background: 'rgba(229,9,20,0.15)', color: 'var(--accent)', border: '1px solid rgba(229,9,20,0.3)' }} onClick={() => handleDelete(ev.event_id, ev.title)}>Delete</button>
                                </div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal && (
                <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="admin-modal">
                        <div className="admin-modal__header">
                            <h2>{editing ? 'Edit Event' : 'Add Event'}</h2>
                            <button className="admin-modal__close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {[
                                { name: 'title', label: 'Title *', type: 'text' },
                                { name: 'category', label: 'Category (Music/Comedy/Sport)', type: 'text' },
                                { name: 'poster_url', label: 'Poster URL', type: 'url' },
                                { name: 'trailer_url', label: 'Promo URL', type: 'url' },
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
                            <div className="admin-modal__actions">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Event'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageEvents;
