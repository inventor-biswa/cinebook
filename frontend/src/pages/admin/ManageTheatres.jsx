import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import ConfirmModal from '../../components/ConfirmModal';
import './Admin.css';

const EMPTY = { name: '', city_id: '', total_seats: 100, address: '' };

function ManageTheatres() {
    const [theatres, setTheatres] = useState([]);
    const [cities, setCities] = useState([]);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);

    const fetchData = () => Promise.all([
        API.get('/admin/theatres').then(r => setTheatres(r.data)),
        API.get('/cities').then(r => setCities(r.data)),
    ]).catch(() => { });

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
    const openEdit = (t) => { setForm(t); setEditing(t.theatre_id); setModal(true); };
    const closeModal = () => { setModal(false); setEditing(null); };
    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.city_id) { toast.error('Name and city are required'); return; }
        setLoading(true);
        try {
            editing ? await API.put(`/admin/theatres/${editing}`, form) : await API.post('/admin/theatres', form);
            toast.success(editing ? 'Theatre updated!' : 'Theatre added!');
            closeModal(); fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
        finally { setLoading(false); }
    };

    const handleDelete = (id, name) => setConfirmTarget({ id, name });
    const confirmDelete = async () => {
        const { id } = confirmTarget;
        setConfirmTarget(null);
        try { await API.delete(`/admin/theatres/${id}`); toast.success('Theatre deleted.'); setTheatres(p => p.filter(t => t.theatre_id !== id)); }
        catch (err) { toast.error(err.response?.data?.message || 'Delete failed — may have active shows.'); }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>Theatres</h1>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Theatre</button>
            </div>
            <div className="admin-table-wrap">
                <table className="admin-table">
                    <thead><tr><th>Name</th><th>City</th><th>Seats</th><th>Address</th><th>Actions</th></tr></thead>
                    <tbody>
                        {theatres.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No theatres yet.</td></tr>
                        ) : theatres.map(t => (
                            <tr key={t.theatre_id}>
                                <td>{t.name}</td>
                                <td>{t.city_name || t.city_id}</td>
                                <td>{t.total_seats}</td>
                                <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.address || '—'}</td>
                                <td><div className="admin-table-actions">
                                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>
                                    <button className="btn btn-sm" style={{ background: 'rgba(229,9,20,0.15)', color: 'var(--accent)', border: '1px solid rgba(229,9,20,0.3)' }} onClick={() => handleDelete(t.theatre_id, t.name)}>Delete</button>
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
                            <h2>{editing ? 'Edit Theatre' : 'Add Theatre'}</h2>
                            <button className="admin-modal__close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label>Name *</label><input name="name" value={form.name || ''} onChange={handleChange} /></div>
                            <div className="form-group">
                                <label>City *</label>
                                <select name="city_id" value={form.city_id || ''} onChange={handleChange}>
                                    <option value="">Select city…</option>
                                    {cities.map(c => <option key={c.city_id} value={c.city_id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label>Total Seats</label><input name="total_seats" type="number" min="1" value={form.total_seats || 100} onChange={handleChange} /></div>
                            <div className="form-group"><label>Address</label><input name="address" value={form.address || ''} onChange={handleChange} /></div>
                            <div className="admin-modal__actions">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Theatre'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={!!confirmTarget}
                title={`Delete "${confirmTarget?.name}"?`}
                message="This theatre will be permanently removed. This will fail if it has active shows."
                confirmLabel="Yes, Delete"
                danger
                onCancel={() => setConfirmTarget(null)}
                onConfirm={confirmDelete}
            />
        </div>
    );
}

export default ManageTheatres;
