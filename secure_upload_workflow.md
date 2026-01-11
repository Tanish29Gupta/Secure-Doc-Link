# Secure Document Collection Workflow Design

## 1. Overview
This document outlines a secure, user-friendly workflow for collecting missing documentation from users. The system prioritizes data privacy, integrity, and ease of use.

## 2. Workflow Logic

### Phase 1: Initiation & Link Generation
1.  **Trigger**: System identifies a user with missing documents (e.g., "ID Proof", "Income Statement").
2.  **Token Generation**:
    *   Generate a high-entropy, cryptographically secure random token (e.g., 32-byte hex string).
    *   Do **not** use predictable IDs (e.g., sequential integers) in the URL.
3.  **Storage**:
    *   Store the token in a database with:
        *   `user_id`: Reference to the user.
        *   `required_docs`: List of specific missing documents.
        *   `expires_at`: Timestamp (e.g., 48 or 72 hours from generation).
        *   `status`: 'active', 'completed', 'expired'.
4.  **URL Construction**:
    *   `https://secure.example.com/upload-request/{token}`

### Phase 2: Communication (User Notification)
Send an email/SMS with the following structure:
*   **Subject**: Action Required: Complete your application for [Service Name]
*   **Greeting**: Personalized (e.g., "Hi Alex,").
*   **The "Why"**: "We noticed a few documents are missing from your application. To finalize your request and ensure your security, we need the following:"
*   **The "What"**: Bulleted list of missing items (e.g., "Copy of Passport", "Utility Bill").
*   **The "How"**:
    *   "Click the secure link below to upload these files directly."
    *   [Button: Upload Documents Securely]
    *   Link expires in [X] hours for your security.
*   **Trust Signals**: Mention encryption (AES-256), data privacy policy, and that support will never ask for passwords.

### Phase 3: User Upload Interface
*   **Authentication**: The token acts as a one-time authentication credential.
*   **UI Components**:
    *   **Header**: Trust badges (Padlock icon, "Secure File Transfer").
    *   **Status**: "Request valid until [Date/Time]".
    *   **Upload Slots**: Distinct drop zones for each required document type.
        *   *Label*: "Government ID"
        *   *Instruction*: "Please upload a clear color scan (PDF, JPG, PNG)."
*   **Client-Side Validation**:
    *   File size limit (e.g., max 10MB per file).
    *   File type restriction (check extension).

### Phase 4: Secure Ingestion & Server-Side Validation
1.  **Files Received**: Files are uploaded via HTTPS (TLS 1.2+).
2.  **Validation Pipeline**:
    *   **File Integrity**: Verify checksums if client-provided, or generate detailed checksums (SHA-256) upon receipt.
    *   **Magic Number Check**: Inspect file headers (hex signatures) to verify actual file type (prevent renaming `.exe` to `.pdf`).
    *   **Malware Scan**: Pass stream through an anti-malware engine (e.g., ClamAV) before final storage.
    *   **Sanitization**: Strip metadata (EXIF data) to remove potential privacy leaks or malicious payloads.
3.  **Storage**:
    *   Store in an encrypted object store (e.g., S3 with SSE-S3 or SSE-KMS).
    *   Filename obfuscation: Rename files to `{uuid}.{ext}` to prevent directory traversal attacks or exposing original filenames.
    *   **Never** store files in the public web root.

### Phase 5: Confirmation & Cleanup
1.  **Success State**:
    *   Show "Upload Successful" screen with a reference receipt number.
    *   Send a confirmation email: "We've received your documents. Our team will review them shortly."
2.  **Token Invalidation**:
    *   Once the submission is successfully processed, mark the token as 'completed' or 'consumed' to prevent reuse (if a one-time flow) or keep active until expiry if edits are allowed.

## 3. Security Considerations

| Feature | Implementation Detail |
| :--- | :--- |
| **Encryption** | TLS 1.3 for transit. AES-256 for rest. |
| **Access Control** | Token is the key. Rate limit access to the upload endpoint (e.g., 5 attempts per IP per minute) to prevent brute-forcing tokens. |
| **Data Retention** | Auto-delete uploaded files from the temporary intake bucket after X days if not processed. |
| **Logging** | Log IP address, User Agent, and timestamp of upload action for audit trails. |
| **Input Sanitization** | Strictly validate all form inputs. Isolate file processing (sandboxing) if possible. |

## 4. Implementation Specifications (Pseudocode/Config)

### Token Generation
```javascript
const crypto = require('crypto');

function generateUploadToken() {
  return crypto.randomBytes(32).toString('hex');
}
```

### Magic Number Validation (Node.js example)
```javascript
import { fileTypeFromBuffer } from 'file-type';

async function validateFileType(buffer) {
  const type = await fileTypeFromBuffer(buffer);
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (!type || !allowed.includes(type.mime)) {
    throw new Error('Invalid file type detected');
  }
  return true;
}
```

### Database Schema (SQL)
```sql
CREATE TABLE upload_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  required_documents JSONB, -- e.g. ["passport", "bank_statement"]
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
