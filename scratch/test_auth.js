async function testRegister() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test' + Date.now() + '@example.com',
                password: 'password123'
            })
        });
        const data = await res.json();
        console.log('Response Status:', res.status);
        console.log('Response Data:', data);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testRegister();
