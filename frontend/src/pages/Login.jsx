import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error('Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            const res = await API.post('/auth/login', form);
            login(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}! 🎬`);
            // Redirect admins to admin dashboard, users to home
            navigate(res.data.user.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left panel — branding */}
            <div className="auth-panel auth-panel--brand">
                <div className="auth-brand">
                    <h1 className="auth-brand__logo">🎬 <span>Cine</span>Book</h1>
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
                        <h2>Welcome back</h2>
                        <p>Sign in to your CineBook account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                        >
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="auth-form__switch">
                        Don't have an account?{' '}
                        <Link to="/register">Create one →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
