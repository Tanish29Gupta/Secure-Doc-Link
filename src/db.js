const uploadRequests = new Map();

module.exports = {
    // Save a new request
    createRequest: (id, data) => {
        uploadRequests.set(id, {
            ...data,
            createdAt: new Date(),
            status: 'active'
        });
        return uploadRequests.get(id);
    },

    // Get a request by ID (token)
    getRequest: (id) => {
        return uploadRequests.get(id);
    },

    // Update status
    updateStatus: (id, status) => {
        const req = uploadRequests.get(id);
        if (req) {
            req.status = status;
            uploadRequests.set(id, req);
        }
    },

    // --- MVP: Vault Metadata Log ---
    // In a real app, this would be a separate DynamoDB table or Postgres table
    vaultLog: [],

    logUpload: (meta) => {
        module.exports.vaultLog.push(meta);
        console.log('[VAULT AUDIT] New File Ingested:', JSON.stringify(meta, null, 2));
        return true;
    }
};
