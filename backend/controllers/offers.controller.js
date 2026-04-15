const pool = require('../config/db');

// ─── GET ACTIVE OFFERS ───────────────────────────────────────────────────────
// GET /api/offers/active
exports.getActiveOffers = async (req, res) => {
    try {
        const [offers] = await pool.query(`
            SELECT offer_id, code, title, description, discount_type, discount_value, min_amount, expiry_date
            FROM offers
            WHERE is_active = true
              AND (expiry_date IS NULL OR expiry_date >= CURDATE())
              AND (max_uses = 0 OR used_count < max_uses)
            ORDER BY created_at DESC
        `);
        res.json(offers);
    } catch (err) {
        console.error('getActiveOffers error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// ─── VALIDATE COUPON CODE ────────────────────────────────────────────────────
// POST /api/offers/validate
// Body: { code, amount }
exports.validateOffer = async (req, res) => {
    const { code, amount } = req.body;
    if (!code || !amount) return res.status(400).json({ message: 'code and amount are required.' });

    try {
        const [rows] = await pool.query(`
            SELECT * FROM offers
            WHERE code = ? AND is_active = true
              AND (expiry_date IS NULL OR expiry_date >= CURDATE())
              AND (max_uses = 0 OR used_count < max_uses)
        `, [code.toUpperCase()]);

        if (rows.length === 0) return res.status(404).json({ message: 'Invalid or expired coupon code.' });

        const offer = rows[0];
        if (parseFloat(amount) < parseFloat(offer.min_amount)) {
            return res.status(400).json({
                message: `Minimum booking amount for this coupon is ₹${offer.min_amount}.`
            });
        }

        let discountAmount = 0;
        if (offer.discount_type === 'percent') {
            discountAmount = Math.floor(parseFloat(amount) * offer.discount_value / 100);
        } else {
            discountAmount = Math.min(offer.discount_value, parseFloat(amount));
        }

        const finalAmount = Math.max(0, parseFloat(amount) - discountAmount);
        res.json({
            valid: true,
            offer_id: offer.offer_id,
            code: offer.code,
            title: offer.title,
            discount_amount: discountAmount,
            final_amount: finalAmount,
        });
    } catch (err) {
        console.error('validateOffer error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// ─── ADMIN: GET ALL OFFERS ───────────────────────────────────────────────────
exports.getAllOffers = async (req, res) => {
    try {
        const [offers] = await pool.query('SELECT * FROM offers ORDER BY created_at DESC');
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// ─── ADMIN: CREATE OFFER ─────────────────────────────────────────────────────
exports.createOffer = async (req, res) => {
    const { code, title, description, discount_type, discount_value, min_amount, max_uses, expiry_date } = req.body;
    try {
        const [result] = await pool.query(
            `INSERT INTO offers (code, title, description, discount_type, discount_value, min_amount, max_uses, expiry_date)
             VALUES (?,?,?,?,?,?,?,?)`,
            [code?.toUpperCase(), title, description, discount_type, discount_value, min_amount || 0, max_uses || 100, expiry_date || null]
        );
        res.status(201).json({ message: 'Offer created.', offer_id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Coupon code already exists.' });
        res.status(500).json({ message: 'Server error.' });
    }
};

// ─── ADMIN: TOGGLE OFFER ─────────────────────────────────────────────────────
exports.toggleOffer = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE offers SET is_active = NOT is_active WHERE offer_id = ?', [id]);
        res.json({ message: 'Offer status toggled.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};
