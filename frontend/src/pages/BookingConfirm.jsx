import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import Layout from '../components/Layout';
import './BookingConfirm.css';

function BookingConfirm() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [step, setStep] = useState('summary');  // 'summary' | 'paying' | 'success'
    const [loading, setLoading] = useState(false);

    // ─── Coupon state ─────────────────────────────────────────────────────────
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedOffer, setAppliedOffer] = useState(null); // { offer_id, code, title, discount_amount, final_amount }

    // Guard: if arriving directly without state, redirect back
    useEffect(() => {
        if (!state?.showId) {
            navigate('/');
        }
    }, []);

    if (!state) return null;

    const { showId, seatIds, totalAmount, show, selectedSeats } = state;

    // Effective amount after coupon
    const finalAmount = appliedOffer ? appliedOffer.final_amount : totalAmount;

    // ─── Apply coupon ─────────────────────────────────────────────────────────
    const applyCoupon = async () => {
        if (!couponCode.trim()) return toast.error('Enter a coupon code first.');
        setCouponLoading(true);
        try {
            const res = await API.post('/offers/validate', {
                code: couponCode.trim().toUpperCase(),
                amount: totalAmount,
            });
            setAppliedOffer(res.data);
            toast.success(`🎉 "${res.data.code}" applied! You save ₹${res.data.discount_amount}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid coupon.');
            setAppliedOffer(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedOffer(null);
        setCouponCode('');
        toast('Coupon removed.', { icon: '🗑️' });
    };

    // ── Step 1: Create booking record in DB ───────────────────────────────────
    const createBooking = async () => {
        setLoading(true);
        try {
            const payload = {
                show_id: showId,
                seat_ids: seatIds,
                ...(appliedOffer ? { offer_id: appliedOffer.offer_id, discount_amount: appliedOffer.discount_amount } : {}),
            };
            const res = await API.post('/bookings', payload);
            setBooking(res.data);
            setStep('paying');
            startRazorpay(res.data.booking_id, res.data.total_amount);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not create booking.');
            setLoading(false);
        }
    };

    // ── Step 2: Open Razorpay checkout ────────────────────────────────────────
    const startRazorpay = async (bookingId, amount) => {
        try {
            const orderRes = await API.post('/payment/create-order', { booking_id: bookingId });
            const { order_id, currency } = orderRes.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: Math.round(amount * 100),   // paise
                currency,
                name: 'QwikShow',
                description: `Booking #${bookingId}`,
                order_id,
                handler: async (response) => {
                    // ── Step 3: Verify payment ────────────────────────────────
                    try {
                        const verifyRes = await API.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            booking_id: bookingId,
                        });
                        setBooking(prev => ({ ...prev, ...verifyRes.data }));
                        setStep('success');
                        toast.success('🎉 Booking Confirmed!');
                    } catch {
                        toast.error('Payment verification failed. Contact support.');
                        navigate('/my-bookings');
                    }
                },
                prefill: { name: '', email: '' },
                theme: { color: '#a855f7' },
                modal: {
                    ondismiss: () => {
                        toast('Payment cancelled. Your seats are still reserved for a few minutes.', { icon: '⚠️' });
                        setStep('summary');
                        setLoading(false);
                    }
                }
            };

            // Load Razorpay script dynamically if not already loaded
            if (!window.Razorpay) {
                await loadRazorpayScript();
            }
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            toast.error('Could not initiate payment. Try again.');
            setLoading(false);
        }
    };

    const loadRazorpayScript = () =>
        new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });

    // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
    if (step === 'success') {
        return (
            <Layout>
                <div className="booking-success">
                    <div className="booking-success__icon">🎉</div>
                    <h1>Booking Confirmed!</h1>
                    {booking?.booking_ref && (
                        <div className="booking-success__ref">
                            <span>Booking Ref</span>
                            <strong>{booking.booking_ref}</strong>
                        </div>
                    )}
                    <p>Your seats have been booked successfully. Enjoy the show!</p>
                    {booking?.points_earned > 0 && (
                        <div className="booking-success__points">
                            🏆 You earned <strong>{booking.points_earned} reward points</strong>!
                        </div>
                    )}
                    <div className="booking-success__seats">
                        {selectedSeats?.map(s => (
                            <span key={s.seat_id} className="badge badge-green">{s.seat_label}</span>
                        ))}
                    </div>
                    <div className="booking-success__actions">
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/my-bookings')}>
                            View My Bookings
                        </button>
                        <button className="btn btn-ghost btn-lg" onClick={() => navigate('/')}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // ── SUMMARY SCREEN ────────────────────────────────────────────────────────
    return (
        <Layout>
            <div className="container section booking-confirm">
                <h1 className="section-title">Confirm Booking</h1>

                <div className="booking-confirm__card">
                    {/* Show details */}
                    <div className="booking-confirm__section">
                        <h3>Show Details</h3>
                        <div className="booking-confirm__row">
                            <span>Venue</span>
                            <span>{show?.theatre_name}</span>
                        </div>
                        <div className="booking-confirm__row">
                            <span>Date</span>
                            <span>{new Date(show?.show_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="booking-confirm__row">
                            <span>Time</span>
                            <span>{show?.show_time?.slice(0, 5)}</span>
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* Seat details */}
                    <div className="booking-confirm__section">
                        <h3>Selected Seats</h3>
                        <div className="booking-confirm__seats">
                            {selectedSeats?.map(s => (
                                <span key={s.seat_id} className="badge badge-red">{s.seat_label}</span>
                            ))}
                        </div>
                        <div className="booking-confirm__row booking-confirm__row--total" style={{ marginTop: '12px' }}>
                            <span>{seatIds.length} × ₹{show?.price}</span>
                            <span className="booking-confirm__total">₹{totalAmount}</span>
                        </div>
                    </div>

                    <hr className="divider" />

                    {/* ── Coupon / Offer section ── */}
                    <div className="booking-confirm__section">
                        <h3>Have a Coupon?</h3>
                        {!appliedOffer ? (
                            <div className="booking-coupon__row">
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                                    style={{ flex: 1, letterSpacing: '1px', fontWeight: 600 }}
                                    disabled={couponLoading}
                                />
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={applyCoupon}
                                    disabled={couponLoading || !couponCode.trim()}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    {couponLoading ? '⏳ Checking…' : 'Apply'}
                                </button>
                            </div>
                        ) : (
                            <div className="booking-coupon__applied">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>🏷️</span>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.95rem' }}>
                                            {appliedOffer.code}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {appliedOffer.title}
                                        </div>
                                    </div>
                                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--success)' }}>− ₹{appliedOffer.discount_amount}</div>
                                        <button
                                            onClick={removeCoupon}
                                            style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Price breakdown */}
                    {appliedOffer && (
                        <>
                            <div className="booking-confirm__row" style={{ marginTop: '4px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                <span style={{ color: 'var(--text-muted)' }}>₹{totalAmount}</span>
                            </div>
                            <div className="booking-confirm__row">
                                <span style={{ color: 'var(--success)' }}>Discount ({appliedOffer.code})</span>
                                <span style={{ color: 'var(--success)', fontWeight: 600 }}>− ₹{appliedOffer.discount_amount}</span>
                            </div>
                            <div className="booking-confirm__row booking-confirm__row--total" style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                <span>Total Payable</span>
                                <span className="booking-confirm__total">₹{finalAmount}</span>
                            </div>
                        </>
                    )}

                    {/* Pay button */}
                    <button
                        className="btn btn-primary btn-full btn-lg"
                        onClick={createBooking}
                        disabled={loading}
                        style={{ marginTop: '20px' }}
                    >
                        {loading ? 'Processing…' : `Pay ₹${finalAmount} via Razorpay`}
                    </button>
                    <p className="booking-confirm__note">
                        🔒 Payments secured by Razorpay. Your seats are locked until payment.
                    </p>
                </div>
            </div>
        </Layout>
    );
}

export default BookingConfirm;
