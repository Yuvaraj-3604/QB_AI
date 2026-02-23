const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'questbridge_secret_key_change_in_production';

/**
 * Sign a JWT token for a user
 */
function signToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

/**
 * Middleware: require any authenticated user
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, email, role }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    }
}

/**
 * Middleware: require host role
 */
function requireHost(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role !== 'host') {
            return res.status(403).json({ error: 'Only hosts can perform this action.' });
        }
        next();
    });
}

/**
 * Middleware: require attendee role
 */
function requireAttendee(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role !== 'attendee') {
            return res.status(403).json({ error: 'Only attendees can perform this action.' });
        }
        next();
    });
}

module.exports = { signToken, requireAuth, requireHost, requireAttendee };
