const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../config/db');

// Initialize Razorpay instance using keys from .env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── CREATE RAZORPAY ORDER ───────────────────────────────────────────────────
// POST /api/payment/create-order
// Body: { booking_id }
// Requires Auth

exports.createOrder = async (req, res) => {
    try {
        const { booking_id } = req.body;
        const user_id = req.user.user_id;

        if (!booking_id) {
            return res.status(400).json({ message: 'booking_id is required.' });
        }

        // 1. Verify the booking belongs to this user and is still pending
        const [bookings] = await pool.query(
            'SELECT total_amount, status FROM bookings WHERE booking_id = ? AND user_id = ?',
            [booking_id, user_id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found or unauthorized.' });
        }

        const booking = bookings[0];

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: `Booking is already ${booking.status}.` });
        }

        // 2. Ask Razorpay to create an order
        // Razorpay expects amount in paise (smallest currency unit), so multiply INR by 100.
        const options = {
            amount: Math.round(booking.total_amount * 100),
            currency: 'INR',
            receipt: `receipt_order_${booking_id}`
        };

        const order = await razorpay.orders.create(options);

        // 3. Return the Razorpay order_id to the frontend
        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error) {
        console.error('createOrder error:', error);
        res.status(500).json({ message: 'Failed to create Razorpay order.' });
    }
};


// ─── VERIFY PAYMENT (WEBHOOK SIMULATION) ───────────────────────────────────
// POST /api/payment/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id }
// Requires Auth

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;
        const user_id = req.user.user_id;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
            return res.status(400).json({ message: 'All payment details are required.' });
        }

        // 1. Verify the cryptographic signature to ensure the request actually came from Razorpay
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({ message: 'Invalid payment signature.' });
        }

        // 2. If authentic, update the booking status to 'confirmed'
        // Ensure we only update if it belongs to the user and is still pending
        const [updateResult] = await pool.query(
            `UPDATE bookings 
       SET status = 'confirmed', payment_id = ? 
       WHERE booking_id = ? AND user_id = ? AND status = 'pending'`,
            [razorpay_payment_id, booking_id, user_id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({ message: 'Failed to confirm booking. It may already be processed or invalid.' });
        }

        res.json({ message: 'Payment verified successfully. Booking confirmed!' });

    } catch (error) {
        console.error('verifyPayment error:', error);
        res.status(500).json({ message: 'Server error during payment verification.' });
    }
};
