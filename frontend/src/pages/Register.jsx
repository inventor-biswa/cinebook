import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import './Auth.css';

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            toast.error('Please fill in all fields.');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        if (form.password !== form.confirm) {
            toast.error('Passwords do not match!');
            return;
        }
        setLoading(true);
        try {
            await API.post('/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password,
            });
            toast.success('Account created! Please sign in. 🎉');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left panel — branding */}
            <div className="auth-panel auth-panel--brand">
                <div className="auth-brand">
                    <h1 className="auth-brand__logo">
                        <span style={{ color: 'var(--primary)' }}>Qwik</span>Show
                    </h1>
                    <p className="auth-brand__tagline">Book seats. Experience magic.</p>
                    <ul className="auth-brand__features">
                        <li>🎟️ Instant seat booking</li>
                        <li>🏙️ Cities across India</li>
                        <li>🎤 Movies & live events</li>
                        <li>💳 Secure Razorpay payments</li>
                    </ul>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="auth-panel auth-panel--form">
                <div className="auth-form-wrap">
                    <div className="auth-form__header">
                        <h2>Create account</h2>
                        <p>Join QwikShow and start booking!</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Biswa Kumar"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reg-email">Email</label>
                            <input
                                id="reg-email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reg-password">Password</label>
                            <input
                                id="reg-password"
                                name="password"
                                type="password"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirm">Confirm Password</label>
                            <input
                                id="confirm"
                                name="confirm"
                                type="password"
                                placeholder="Repeat password"
                                value={form.confirm}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p className="auth-form__switch">
                        Already have an account?{' '}
                        <Link to="/login">Sign in →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
