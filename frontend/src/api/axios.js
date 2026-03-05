import axios from 'axios';

// ─── AXIOS INSTANCE ────────────────────────────────────────────────────────────
// Pre-configured with the backend base URL. Every API call in the app uses this
// instead of raw axios, so we only ever need to change the URL in one place.
const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// ─── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
// Runs automatically before EVERY request. If a JWT token exists in localStorage,
// we attach it as an Authorization header so the backend can identify the user.
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
