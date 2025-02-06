const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    try {
        // Get token from cookie
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = authMiddleware; 