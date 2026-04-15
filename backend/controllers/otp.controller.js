const crypto = require('crypto');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');
const { sendMail } = require('../utils/mailer');

// ─── SEND OTP ─────────────────────────────────────────────────────────────────
// POST /api/auth/otp/send
// Body: { email }

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });

        // Check user exists
        const [rows] = await pool.query(
            'SELECT user_id, name FROM users WHERE email = ?',
            [email]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No account found with this email.' });
        }

        // Invalidate any previous unused OTPs for this email
        await pool.query(
            'UPDATE otp_tokens SET used = 1 WHERE email = ? AND used = 0',
            [email]
        );

        // Generate a 6-digit OTP using crypto (no third-party API)
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        await pool.query(
            'INSERT INTO otp_tokens (email, otp, expires_at) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        // Send via Nodemailer (Gmail SMTP)
        await sendMail(
            email,
            'Your QwikShow Login OTP',
            `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #0f0f1a; color: #ffffff; border-radius: 12px; border: 1px solid rgba(168,85,247,0.3);">
              <h2 style="color: #a855f7; margin-bottom: 8px;">QwikShow</h2>
              <p style="color: #cccccc; margin-bottom: 24px;">Your one-time login code:</p>
              <div style="text-align: center; background: rgba(168,85,247,0.1); border: 2px dashed rgba(168,85,247,0.4); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #a855f7;">${otp}</span>
              </div>
              <p style="color: #aaaaaa; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
              <p style="color: #666688; font-size: 12px; margin-top: 16px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
            `
        );

        res.json({ message: 'OTP sent to your email.' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
};


// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
// POST /api/auth/otp/verify
// Body: { email, otp }

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

        // Find a valid, unused OTP for this email
        const [tokens] = await pool.query(
            `SELECT id FROM otp_tokens
             WHERE email = ? AND otp = ? AND used = 0 AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [email, otp]
        );

        if (tokens.length === 0) {
            return res.status(401).json({ message: 'Invalid or expired OTP.' });
        }

        // Mark OTP as used
        await pool.query('UPDATE otp_tokens SET used = 1 WHERE id = ?', [tokens[0].id]);

        // Fetch user details
        const [users] = await pool.query(
            'SELECT user_id, name, email, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];

        // Sign JWT (same as regular login)
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful.',
            token,
            user: {
                user_id: user.user_id,
                name:    user.name,
                email:   user.email,
                role:    user.role,
            },
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
};
