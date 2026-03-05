// This middleware runs AFTER auth.js.
// auth.js confirms the user is logged in and attaches req.user.
// isAdmin.js confirms that logged-in user has the 'admin' role.
//
// Usage on admin routes:
//   router.post('/movies', auth, isAdmin, createMovie)
//                          ^^^^  ^^^^^^^
//               verify JWT first, then check role

module.exports = (req, res, next) => {
    // req.user is populated by auth.js which must run before this
    if (req.user && req.user.role === 'admin') {
        next(); // User is admin — allow through to the controller
    } else {
        // User is logged in but is NOT an admin → 403 Forbidden (not 401)
        // 401 = "who are you?" | 403 = "I know who you are, but you can't do this"
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};
