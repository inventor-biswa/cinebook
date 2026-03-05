const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ─── REGISTER ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password }

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Basic validation — all fields are required
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // 2. Check if a user with this email already exists
        const [existing] = await pool.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // 3. Hash the password — NEVER store plain text passwords
        //    Salt rounds = 10 (balances security vs performance)
        const password_hash = await bcrypt.hash(password, 10);

        // 4. Insert the new user into the database
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, password_hash]
        );

        res.status(201).json({
            message: 'Registration successful.',
            user_id: result.insertId
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};


// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // 2. Find the user by email
        const [rows] = await pool.query(
            'SELECT user_id, name, email, password_hash, role FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            // Use a vague message — don't reveal whether the email exists or not (security best practice)
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = rows[0];

        // 3. Compare the entered password against the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 4. Sign a JWT token valid for 7 days
        //    The payload contains only what's needed — user_id and role
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Return the token + basic user info (no password_hash!)
        res.json({
            message: 'Login successful.',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};
