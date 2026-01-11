# Secure Document Collection POC

A strict, secure workflow for collecting missing user documents using temporary, encrypted upload links. This Proof-of-Concept demonstrates secure token generation, magic-number file validation, and secure intake.

## Features
*   **Secure Links**: 32-byte high-entropy tokens with expiration logic.
*   **Strict Validation**: Prevents file spoofing by checking magic bytes (hex signatures).
*   **Safe Storage**: Renames files with unique IDs to prevent directory traversal.
*   **File Integriy (MVP)**: Automatically calculates **SHA-256 Hash** for every upload.
*   **Vault Logging (MVP)**: Generates a JSON receipt with timestamp, user ID, and file hash.

## Prerequisites
*   Node.js (v14 or later)
*   npm

## Installation
```bash
git clone https://github.com/Tanish29Gupta/Secure-Doc-Link.git
cd Secure-Doc-Link
npm install
```

## How to Run
1.  **Start the Server**:
    ```bash
    node src/server.js
    ```
    The server will start at `http://localhost:3000`.

2.  **Generate a Link (Admin Flow)**:
    Open your browser to:
    `http://localhost:3000/admin.html`
    
    *   Enter a User ID (e.g., `user-test`).
    *   Select a document type.
    *   Click **Generate Link**.

3.  **Upload a File (User Flow)**:
    *   Click the generated link (or copy-paste it into a new tab).
    *   You will see the secure upload page.
    *   Select a file (PDF, JPG, or PNG) and click **Upload Securely**.

## How to Test Security
Included is an automated verification script that tests both valid uploads and "fake" malicious uploads.

1.  **Generate Test Files**:
    ```bash
    node test_gen.js
    ```
    This creates `valid.pdf`, `valid.jpg`, and `fake.pdf` (a text file disguised as a PDF).

2.  **Run Verification**:
    ```bash
    node verify_full.js
    ```
    
    **Expected Output**:
    *   ✅ Valid file accepted.
    *   ✅ Fake file rejected correctly: File content does not match extension.

## Tech Stack
*   **Backend**: Node.js, Express
*   **Security**: Helmet, Crypto, Multer
*   **Frontend**: HTML5, Vanilla JS
