const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { createUploadLink, validateToken } = require('./tokens');
const { upload, validateFileHeader } = require('./upload');
const db = require('./db');

const app = express();
const PORT = 3000;

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- ADMIN API (To simulate sending the link) ---
app.post('/api/admin/create-request', (req, res) => {
    const { userId, missingDocs } = req.body;
    if (!userId || !missingDocs) return res.status(400).json({ error: 'Missing fields' });

    const token = createUploadLink(userId, missingDocs);
    const link = `http://localhost:${PORT}/upload.html?token=${token}`;

    res.json({ success: true, link, token });
});

// --- PUBLIC USER API ---

// 1. Get Request Details (to show user what is needed)
app.get('/api/request/:token', validateToken, (req, res) => {
    const { requiredDocs, expiresAt, status } = req.uploadRequest;
    res.json({ requiredDocs, expiresAt, status });
});

// 2. Upload Document
app.post('/api/upload/:token', validateToken, upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Validate Magic Number (Strict check)
        const isValid = validateFileHeader(req.file.path, req.file.mimetype);
        if (!isValid) {
            // Delete the invalid file immediately
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'File content does not match extension (Spoofing detected).' });
        }

        // Success - in real app, move to S3 here
        res.json({ success: true, message: 'File uploaded safely.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server validation error' });
    }
});

app.listen(PORT, () => {
    console.log(`Secure Upload Server running at http://localhost:${PORT}`);
    console.log(`Simulate a request via POST /api/admin/create-request`);
});
