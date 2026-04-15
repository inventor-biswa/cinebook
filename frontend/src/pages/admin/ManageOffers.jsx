import { useState, useEffect } from 'react';
import API from '../../api/axios';

function ManageOffers() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        code: '', title: '', description: '',
        discount_type: 'percent', discount_value: '',
        min_amount: '', max_uses: 100, expiry_date: ''
    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const fetchOffers = () => {
        setLoading(true);
        API.get('/offers').then(r => setOffers(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { fetchOffers(); }, []);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await API.post('/offers', form);
            setMsg('✅ Offer created!');
            setForm({ code: '', title: '', description: '', discount_type: 'percent', discount_value: '', min_amount: '', max_uses: 100, expiry_date: '' });
            fetchOffers();
        } catch (err) {
            setMsg('❌ ' + (err.response?.data?.message || 'Error'));
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const toggle = async (id) => {
        await API.patch(`/offers/${id}/toggle`);
        fetchOffers();
    };

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 700 }}>🎁 Manage Offers</h2>

            {/* Create Form */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Create New Offer</h3>
                {msg && <p style={{ color: msg.startsWith('✅') ? 'var(--success)' : 'var(--error)', marginBottom: '12px' }}>{msg}</p>}
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                        <label>Coupon Code *</label>
                        <input name="code" value={form.code} onChange={handleChange} placeholder="e.g. SAVE50" required style={{ textTransform: 'uppercase' }} />
                    </div>
                    <div className="form-group">
                        <label>Title *</label>
                        <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Weekend Special" required />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                        <label>Description</label>
                        <input name="description" value={form.description} onChange={handleChange} placeholder="Short description" />
                    </div>
                    <div className="form-group">
                        <label>Discount Type</label>
                        <select name="discount_type" value={form.discount_type} onChange={handleChange}>
                            <option value="percent">Percentage (%)</option>
                            <option value="flat">Flat Amount (₹)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Discount Value *</label>
                        <input name="discount_value" type="number" value={form.discount_value} onChange={handleChange} placeholder={form.discount_type === 'percent' ? '20 (%)' : '100 (₹)'} required />
                    </div>
                    <div className="form-group">
                        <label>Min. Booking Amount (₹)</label>
                        <input name="min_amount" type="number" value={form.min_amount} onChange={handleChange} placeholder="0 = no minimum" />
                    </div>
                    <div className="form-group">
                        <label>Max Uses</label>
                        <input name="max_uses" type="number" value={form.max_uses} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Expiry Date</label>
                        <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} />
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Creating…' : 'Create Offer'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Offers Table */}
            <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>All Offers</h3>
            {loading ? <p>Loading…</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {offers.map(o => (
                        <div key={o.offer_id} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', opacity: o.is_active ? 1 : 0.5 }}>
                            <div style={{ flex: 1 }}>
                                <strong style={{ fontFamily: 'monospace', color: 'var(--primary)', fontSize: '1rem' }}>{o.code}</strong>
                                <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{o.title}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {o.discount_type === 'percent' ? `${o.discount_value}% off` : `₹${o.discount_value} off`}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Used: {o.used_count}/{o.max_uses}
                            </span>
                            <span className={`badge ${o.is_active ? 'badge-green' : 'badge-gray'}`}>
                                {o.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <button
                                onClick={() => toggle(o.offer_id)}
                                className="btn btn-ghost btn-sm"
                            >
                                {o.is_active ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                    ))}
                    {offers.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No offers yet.</p>}
                </div>
            )}
        </div>
    );
}

export default ManageOffers;
