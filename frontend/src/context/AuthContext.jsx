import { createContext, useContext, useState } from 'react';

// ─── CONTEXT DEFINITION ────────────────────────────────────────────────────────
// AuthContext holds the logged-in user's data and exposes login/logout functions.
// Any component in the app can call useAuth() to get the current user state.
const AuthContext = createContext(null);

// ─── PROVIDER ──────────────────────────────────────────────────────────────────
// Wrap the whole app in this so every page has access to auth state.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // On page reload, try to restore user from localStorage
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || null;
    });

    // Called after a successful POST /api/auth/login
    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', jwtToken);
    };

    // Clears all session data
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── CUSTOM HOOK ───────────────────────────────────────────────────────────────
// Usage in any component:  const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
