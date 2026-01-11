document.getElementById('btnTransport').addEventListener('click', generateLink);

async function generateLink() {
    const userId = document.getElementById('userId').value;
    const docType = document.getElementById('docType').value;
    const btn = document.getElementById('btnTransport');

    // Basic validation
    if (!userId) {
        alert('Please enter a User ID');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Generating...';

    try {
        const res = await fetch('/api/admin/create-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, missingDocs: [docType] })
        });

        const data = await res.json();

        if (data.success) {
            const resultDiv = document.getElementById('result');
            const linkA = document.getElementById('link');
            // Use full URL
            const fullLink = data.link.startsWith('http') ? data.link : window.location.origin + data.link;

            linkA.href = fullLink;
            linkA.textContent = fullLink;
            resultDiv.style.display = 'block';
        } else {
            alert('Server Error: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
        alert('Network Request Failed: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generate Link';
    }
}
