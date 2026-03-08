
async function testFetch() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/health');
        const data = await response.json();
        console.log('GET /api/health →', response.status, data);

        const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password' })
        });
        const loginData = await loginRes.json();
        console.log('POST /api/auth/login →', loginRes.status, loginData);
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}

testFetch();
