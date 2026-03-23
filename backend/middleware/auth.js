const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'diabetcare_secret_key_2024';

// General auth middleware — verifies JWT and attaches user to request
const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

// Hospital-only middleware — must be used AFTER auth
const hospitalOnly = (req, res, next) => {
    if (req.user.role !== 'hospital') {
        return res.status(403).json({ error: 'Access denied. Hospital staff only.' });
    }
    next();
};

// Patient-only middleware — must be used AFTER auth
const patientOnly = (req, res, next) => {
    if (req.user.role !== 'patient') {
        return res.status(403).json({ error: 'Access denied. Patients only.' });
    }
    next();
};

// Helper to generate JWT
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { auth, hospitalOnly, patientOnly, generateToken, JWT_SECRET };
