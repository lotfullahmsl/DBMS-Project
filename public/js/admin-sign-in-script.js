async function verifySignIn() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    if (!username || !password) {
        errorMessage.textContent = 'Please enter both username and password.';
        return;
    }

    try {
        const response = await fetch('http://localhost:3001/admin/verify-sign-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Include cookies for session
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Redirect to login page with absolute URL
            window.location.href = 'http://localhost:3000/admin/login';
            // window.location.href = 'http://localhost:3000/index.html';
        } else {
            errorMessage.textContent = result.message || 'Invalid username or password.';
        }
    } catch (error) {
        console.error('Error verifying sign-in:', error);
        errorMessage.textContent = 'Failed to verify sign-in. Please try again.';
    }
}