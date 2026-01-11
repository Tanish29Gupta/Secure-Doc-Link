const crypto = require('crypto');
const db = require('./db');

// Generate a secure random token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Create a new upload link for a user
const createUploadLink = (userId, missingDocs) => {
    const token = generateToken();
    // In a real app, you might salt/hash this token before storing, 
    // but for this POC we store it as the lookup key.

    // expiry 48 hours
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    db.createRequest(token, {
        userId,
        requiredDocs: missingDocs,
        expiresAt
    });

    return token;
};

// Middleware to validate token
const validateToken = (req, res, next) => {
    const token = req.params.token || req.body.token || req.header('X-Upload-Token');

    if (!token) {
        return res.status(401).json({ error: 'Missing token' });
    }

    const requestData = db.getRequest(token);

    if (!requestData) {
        return res.status(403).json({ error: 'Invalid token' });
    }

    if (requestData.status !== 'active') {
        return res.status(403).json({ error: 'Link is no longer active' });
    }

    if (new Date() > requestData.expiresAt) {
        return res.status(403).json({ error: 'Link has expired' });
    }

    // Attach request data to the request object
    req.uploadRequest = requestData;
    next();
};

module.exports = { createUploadLink, validateToken };
