const jwt = require('jsonwebtoken');

// This middleware runs on every PROTECTED route before the controller.
// It reads the token from the request header, verifies it, and attaches
// the decoded user info to req.user for controllers to use downstream.

module.exports = (req, res, next) => {
    // 1. Read the Authorization header — expected format: "Bearer <token>"
    const authHeader = req.headers['authorization'];

    // 2. If no header present at all, the user is not logged in
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // 3. Split "Bearer <token>" and grab just the token part
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token missing.' });
    }

    // 4. Verify the token using the same secret we signed it with at login.
    //    If valid, jwt.verify() returns the decoded payload { user_id, role }.
    //    If expired or tampered, it throws an error — caught in the catch block.
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach to request so controllers can read req.user.user_id
        next();             // Hand off to the next middleware or controller
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
