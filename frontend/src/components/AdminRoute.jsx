import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── ADMIN ROUTE ───────────────────────────────────────────────────────────────
// Wraps any page that requires the user to have role === 'admin'.
// If not logged in → redirects to /login
// If logged in but not admin → redirects to /
// If admin → renders the page normally
function AdminRoute({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;
    return children;
}

export default AdminRoute;
