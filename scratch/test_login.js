async function testLogin() {
    try {
        // First register a user
        const email = 'login_test_' + Date.now() + '@example.com';
        const password = 'password123';
        
        await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Login Test',
                email: email,
                password: password
            })
        });

        // Now login
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        console.log('Login Response Status:', res.status);
        console.log('Login Response Data:', data);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testLogin();
