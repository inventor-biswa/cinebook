import { useState, useEffect } from 'react';
import API from '../api/axios';
import Layout from '../components/Layout';

function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        API.get('/offers/active')
            .then(res => setOffers(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const copyCode = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(code);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    return (
        <Layout>
            <div className="container section">
                <h1 className="section-title">🎁 Offers &amp; Discounts</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                    Use these coupon codes at checkout to save on your bookings!
                </p>

                {loading ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
                        ))}
                    </div>
                ) : offers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '3rem' }}>🎟️</p>
                        <p>No active offers right now. Check back soon!</p>
                    </div>
                ) : (
                    <div className="offers-grid">
                        {offers.map(o => (
                            <div key={o.offer_id} className="offer-card">
                                <div className="offer-card__left">
                                    <span className="offer-card__tag">
                                        {o.discount_type === 'percent' ? `${o.discount_value}% OFF` : `₹${o.discount_value} OFF`}
                                    </span>
                                    <h3 className="offer-card__title">{o.title}</h3>
                                    <p className="offer-card__desc">{o.description}</p>
                                    {o.min_amount > 0 && (
                                        <p className="offer-card__min">Min. booking: ₹{o.min_amount}</p>
                                    )}
                                    {o.expiry_date && (
                                        <p className="offer-card__expiry">
                                            Valid till: {new Date(o.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                                <div className="offer-card__right">
                                    <div className="offer-card__code">{o.code}</div>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => copyCode(o.code)}
                                    >
                                        {copied === o.code ? '✓ Copied!' : 'Copy Code'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .offers-grid { display: flex; flex-direction: column; gap: 16px; }
                .offer-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;
                    background: var(--bg-card);
                    border: 1px solid rgba(168,85,247,0.2);
                    border-left: 4px solid var(--primary);
                    border-radius: 16px;
                    padding: 24px 28px;
                    backdrop-filter: blur(10px);
                    transition: var(--transition);
                }
                .offer-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card); border-color: rgba(168,85,247,0.5); }
                .offer-card__tag {
                    display: inline-block;
                    background: var(--gradient);
                    border-radius: 999px;
                    padding: 4px 14px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 10px;
                }
                .offer-card__title { font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; }
                .offer-card__desc { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 6px; }
                .offer-card__min, .offer-card__expiry { font-size: 0.8rem; color: var(--text-muted); }
                .offer-card__right { display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0; }
                .offer-card__code {
                    font-family: monospace;
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: var(--primary);
                    background: var(--primary-dim);
                    border: 1px dashed rgba(168,85,247,0.4);
                    border-radius: 8px;
                    padding: 8px 20px;
                    letter-spacing: 2px;
                }
                @media(max-width:600px){
                    .offer-card { flex-direction: column; align-items: flex-start; }
                }
            `}</style>
        </Layout>
    );
}

export default OffersPage;
