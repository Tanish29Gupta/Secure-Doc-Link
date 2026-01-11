const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Securely renaming file: timestamp-random-extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Magic Number Validation
const validateFileHeader = (filePath, mimetype) => {
    const buffer = Buffer.alloc(8); // Read first 8 bytes
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    const matchBuffer = (buf, hex) => {
        const check = Buffer.from(hex, 'hex');
        return buf.slice(0, check.length).equals(check);
    };

    // JPEG: FF D8 FF
    if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
        return matchBuffer(buffer, 'ffd8ff');
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    else if (mimetype === 'image/png') {
        return matchBuffer(buffer, '89504e470d0a1a0a');
    }
    // PDF: 25 50 44 46
    else if (mimetype === 'application/pdf') {
        return matchBuffer(buffer, '25504446');
    }

    return false;
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
        }
        cb(null, true);
    }
});

module.exports = { upload, validateFileHeader };
