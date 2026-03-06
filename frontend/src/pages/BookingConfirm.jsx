import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import Layout from '../components/Layout';
import './BookingConfirm.css';

function BookingConfirm() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null); // created booking from backend
    const [step, setStep] = useState('summary');  // 'summary' | 'paying' | 'success'
    const [loading, setLoading] = useState(false);

    // Guard: if arriving directly without state, redirect back
    useEffect(() => {
        if (!state?.showId) {
            navigate('/');
        }
    }, []);

    if (!state) return null;

    const { showId, seatIds, totalAmount, show, selectedSeats } = state;

    // ── Step 1: Create booking record in DB ───────────────────────────────────
    const createBooking = async () => {
        setLoading(true);
        try {
            const res = await API.post('/bookings', { show_id: showId, seat_ids: seatIds });
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
                amount: amount * 100,   // paise
                currency,
                name: 'CineBook',
                description: `Booking #${bookingId}`,
                order_id,
                handler: async (response) => {
                    // ── Step 3: Verify payment ────────────────────────────────
                    try {
                        await API.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            booking_id: bookingId,
                        });
                        setStep('success');
                        toast.success('🎉 Booking Confirmed!');
                    } catch {
                        toast.error('Payment verification failed. Contact support.');
                        navigate('/my-bookings');
                    }
                },
                prefill: { name: '', email: '' },
                theme: { color: '#e50914' },
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
                    <div className="booking-success__icon">🎟️</div>
                    <h1>Booking Confirmed!</h1>
                    <p>Your seats have been booked successfully. Enjoy the show!</p>
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
                        <div className="booking-confirm__row booking-confirm__row--total">
                            <span>{seatIds.length} × ₹{show?.price}</span>
                            <span className="booking-confirm__total">₹{totalAmount}</span>
                        </div>
                    </div>

                    {/* Pay button */}
                    <button
                        className="btn btn-primary btn-full btn-lg"
                        onClick={createBooking}
                        disabled={loading}
                    >
                        {loading ? 'Processing…' : `Pay ₹${totalAmount} via Razorpay`}
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
