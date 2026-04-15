import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    // ── Tab state: 'password' | 'otp'
    const [tab, setTab] = useState('password');

    // ── Password login
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    // ── OTP login
    const [otpEmail, setOtpEmail] = useState('');
    const [otpStep, setOtpStep] = useState(1);   // 1 = email, 2 = code
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const otpRefs = useRef([]);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendTimer]);

    // ── Password login handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) { toast.error('Please fill in all fields.'); return; }
        setLoading(true);
        try {
            const res = await API.post('/auth/login', form);
            login(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}! 🎬`);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        } finally { setLoading(false); }
    };

    // ── OTP: send code
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!otpEmail) { toast.error('Enter your email first.'); return; }
        setOtpLoading(true);
        try {
            await API.post('/auth/otp/send', { email: otpEmail });
            toast.success('OTP sent! Check your inbox.');
            setOtpStep(2);
            setResendTimer(60);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP.');
        } finally { setOtpLoading(false); }
    };

    // ── OTP: verify code
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) { toast.error('Enter all 6 digits.'); return; }
        setOtpLoading(true);
        try {
            const res = await API.post('/auth/otp/verify', { email: otpEmail, otp: code });
            login(res.data.user, res.data.token);
            toast.success(`Welcome, ${res.data.user.name}! 🎬`);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally { setOtpLoading(false); }
    };

    // ── OTP box handlers
    const handleOtpChange = (i, val) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp];
        next[i] = val.slice(-1);
        setOtp(next);
        if (val && i < 5) otpRefs.current[i + 1]?.focus();
    };
    const handleOtpKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    };
    const handleOtpPaste = (e) => {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (text.length === 6) {
            setOtp(text.split(''));
            otpRefs.current[5]?.focus();
        }
        e.preventDefault();
    };

    const resetOtp = () => { setOtpStep(1); setOtp(['', '', '', '', '', '']); setResendTimer(0); };

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
                        <li>🎤 Movies &amp; live events</li>
                        <li>💳 Secure Razorpay payments</li>
                    </ul>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="auth-panel auth-panel--form">
                <div className="auth-form-wrap">
                    <div className="auth-form__header">
                        <h2>Welcome back</h2>
                        <p>Sign in to your QwikShow account</p>
                    </div>

                    {/* ── Tab switcher ── */}
                    <div className="login-tabs">
                        <button
                            className={`login-tab ${tab === 'password' ? 'login-tab--active' : ''}`}
                            onClick={() => { setTab('password'); resetOtp(); }}
                            type="button"
                        >🔑 Password</button>
                        <button
                            className={`login-tab ${tab === 'otp' ? 'login-tab--active' : ''}`}
                            onClick={() => { setTab('otp'); resetOtp(); }}
                            type="button"
                        >📧 OTP</button>
                    </div>

                    {/* ════════ PASSWORD LOGIN ════════ */}
                    {tab === 'password' && (
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input id="email" name="email" type="email" placeholder="you@example.com"
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    autoComplete="email" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input id="password" name="password" type="password" placeholder="••••••••"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                    autoComplete="current-password" />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                                {loading ? 'Signing in…' : 'Sign In'}
                            </button>
                        </form>
                    )}

                    {/* ════════ OTP LOGIN ════════ */}
                    {tab === 'otp' && (
                        <>
                            {/* Step 1: Email */}
                            {otpStep === 1 && (
                                <form onSubmit={handleSendOtp} className="auth-form">
                                    <div className="form-group">
                                        <label htmlFor="otp-email">Email address</label>
                                        <input id="otp-email" type="email" placeholder="you@example.com"
                                            value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                                            autoComplete="email" />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={otpLoading}>
                                        {otpLoading ? 'Sending…' : 'Send OTP →'}
                                    </button>
                                </form>
                            )}

                            {/* Step 2: OTP code */}
                            {otpStep === 2 && (
                                <form onSubmit={handleVerifyOtp} className="auth-form">
                                    <p className="otp-hint">
                                        Enter the 6-digit code sent to <strong>{otpEmail}</strong>
                                    </p>
                                    <div className="otp-boxes" onPaste={handleOtpPaste}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={el => otpRefs.current[i] = el}
                                                className="otp-box"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpChange(i, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                            />
                                        ))}
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={otpLoading}>
                                        {otpLoading ? 'Verifying…' : 'Verify & Sign In'}
                                    </button>
                                    <div className="otp-resend">
                                        {resendTimer > 0 ? (
                                            <span className="otp-resend__countdown">Resend in {resendTimer}s</span>
                                        ) : (
                                            <button type="button" className="otp-resend__btn" onClick={handleSendOtp} disabled={otpLoading}>
                                                Resend OTP
                                            </button>
                                        )}
                                        <button type="button" className="otp-resend__btn" onClick={resetOtp}>
                                            ← Change email
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}

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
