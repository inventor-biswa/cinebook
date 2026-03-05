import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── PRIVATE ROUTE ─────────────────────────────────────────────────────────────
// Wraps any page that requires the user to be logged in.
// If user is not authenticated → redirects to /login
// If user IS authenticated → renders the page normally
function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
