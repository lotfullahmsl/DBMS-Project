document.addEventListener('DOMContentLoaded', function() {
    // Get all elements
    const signinTab = document.getElementById('signin-tab');
    const signupTab = document.getElementById('signup-tab');
    const showSignupLink = document.getElementById('show-signup');
    const showSigninLink = document.getElementById('show-signin');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const illustration = document.querySelector('.floating');
    const signinError = document.getElementById('signin-error');
    const signupError = document.getElementById('signup-error');

    // Check if elements exist
    if (!signinTab || !signupTab || !showSignupLink || !showSigninLink || !signinForm || !signupForm || !illustration || !signinError || !signupError) {
        console.error('One or more elements not found:', {
            signinTab: !!signinTab,
            signupTab: !!signupTab,
            showSignupLink: !!showSignupLink,
            showSigninLink: !!showSigninLink,
            signinForm: !!signinForm,
            signupForm: !!signupForm,
            illustration: !!illustration,
            signinError: !!signinError,
            signupError: !!signupError
        });
        return;
    }

    // Toggle to Sign-Up form
    showSignupLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Show Sign-Up link clicked');
        signinForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signinTab.classList.remove('border-emerald-600', 'text-emerald-600');
        signinTab.classList.add('text-gray-500');
        signupTab.classList.add('border-emerald-600', 'text-emerald-600');
        signupTab.classList.remove('text-gray-500');
        signinError.classList.add('hidden');
    });

    // Toggle to Sign-In form
    showSigninLink.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Show Sign-In link clicked');
        signupForm.classList.add('hidden');
        signinForm.classList.remove('hidden');
        signupTab.classList.remove('border-emerald-600', 'text-emerald-600');
        signupTab.classList.add('text-gray-500');
        signinTab.classList.add('border-emerald-600', 'text-emerald-600');
        signinTab.classList.remove('text-gray-500');
        signupError.classList.add('hidden');
    });

    // Sign-In tab click handler
    signinTab.addEventListener('click', function() {
        console.log('Sign-In tab clicked');
        signupForm.classList.add('hidden');
        signinForm.classList.remove('hidden');
        signupTab.classList.remove('border-emerald-600', 'text-emerald-600');
        signupTab.classList.add('text-gray-500');
        this.classList.add('border-emerald-600', 'text-emerald-600');
        this.classList.remove('text-gray-500');
        signupError.classList.add('hidden');
    });

    // Sign-Up tab click handler
    signupTab.addEventListener('click', function() {
        console.log('Sign-Up tab clicked');
        signinForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signinTab.classList.remove('border-emerald-600', 'text-emerald-600');
        signinTab.classList.add('text-gray-500');
        this.classList.add('border-emerald-600', 'text-emerald-600');
        this.classList.remove('text-gray-500');
        signinError.classList.add('hidden');
    });

    // Toggle password visibility for sign-in form
    document.getElementById('toggle-signin-password').addEventListener('click', function() {
        console.log('Toggling sign-in password visibility');
        const passwordInput = document.getElementById('signin-password');
        const icon = this;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });

    // Toggle password visibility for sign-up form
    document.getElementById('toggle-signup-password').addEventListener('click', function() {
        console.log('Toggling sign-up password visibility');
        const passwordInput = document.getElementById('signup-password');
        const icon = this;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });

    // Add floating animation to illustration on hover
    illustration.addEventListener('mouseenter', function() {
        console.log('Illustration mouseenter');
        this.style.animation = 'floating 1.5s ease-in-out infinite';
    });
    illustration.addEventListener('mouseleave', function() {
        console.log('Illustration mouseleave');
        this.style.animation = 'floating 3s ease-in-out infinite';
    });

    // Sign-up logic
    document.getElementById('signup-button').addEventListener('click', async function(e) {
        e.preventDefault();
        signupError.classList.add('hidden');

        const signupButton = this;
        signupButton.disabled = true;
        const originalText = signupButton.textContent;
        signupButton.textContent = 'Loading...';

        const firstName = document.getElementById('signup-firstname').value.trim();
        const lastName = document.getElementById('signup-lastname').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const termsCheckbox = document.getElementById('terms').checked;

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            signupError.textContent = 'All fields are required';
            signupError.classList.remove('hidden');
            signupButton.disabled = false;
            signupButton.textContent = originalText;
            return;
        }

        if (!termsCheckbox) {
            signupError.textContent = 'You must agree to the Terms and Privacy Policy';
            signupError.classList.remove('hidden');
            signupButton.disabled = false;
            signupButton.textContent = originalText;
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            signupError.textContent = 'Invalid email format';
            signupError.classList.remove('hidden');
            signupButton.disabled = false;
            signupButton.textContent = originalText;
            return;
        }

        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            signupError.textContent = 'Password must be at least 8 characters long and include a number and a special character';
            signupError.classList.remove('hidden');
            signupButton.disabled = false;
            signupButton.textContent = originalText;
            return;
        }

        if (password !== confirmPassword) {
            signupError.textContent = 'Passwords do not match';
            signupError.classList.remove('hidden');
            signupButton.disabled = false;
            signupButton.textContent = originalText;
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName
                })
            });

            const data = await response.json();

            if (!data.success) {
                signupError.textContent = data.message || 'Sign-up failed';
                signupError.classList.remove('hidden');
                signupButton.disabled = false;
                signupButton.textContent = originalText;
                return;
            }

            signupForm.classList.add('hidden');
            signinForm.classList.remove('hidden');
            signupTab.classList.remove('border-emerald-600', 'text-emerald-600');
            signupTab.classList.add('text-gray-500');
            signinTab.classList.add('border-emerald-600', 'text-emerald-600');
            signinTab.classList.remove('text-gray-500');
            alert('Sign-up successful! Please sign in.');
        } catch (error) {
            console.error('Error during sign-up:', error);
            signupError.textContent = 'An error occurred. Please try again.';
            signupError.classList.remove('hidden');
        } finally {
            signupButton.disabled = false;
            signupButton.textContent = originalText;
        }
    });

    // Sign-in logic
    document.getElementById('signin-button').addEventListener('click', async function(e) {
        e.preventDefault();
        signinError.classList.add('hidden');

        const signinButton = this;
        signinButton.disabled = true;
        const originalText = signinButton.textContent;
        signinButton.textContent = 'Loading...';

        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;

        if (!email || !password) {
            signinError.textContent = 'Email and password are required';
            signinError.classList.remove('hidden');
            signinButton.disabled = false;
            signinButton.textContent = originalText;
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            signinError.textContent = 'Invalid email format';
            signinError.classList.remove('hidden');
            signinButton.disabled = false;
            signinButton.textContent = originalText;
            return;
        }

        try {
            const response = await fetch('/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!data.success) {
                signinError.textContent = data.message || 'Sign-in failed';
                signinError.classList.remove('hidden');
                signinButton.disabled = false;
                signinButton.textContent = originalText;
                return;
            }

            localStorage.setItem('token', data.token);
            window.location.href = '/index.html';
        } catch (error) {
            console.error('Error during sign-in:', error);
            signinError.textContent = 'An error occurred. Please try again.';
            signinError.classList.remove('hidden');
        } finally {
            signinButton.disabled = false;
            signinButton.textContent = originalText;
        }
    });

    // Google Sign-In Callback
    window.handleCredentialResponse = function(response) {
        console.log('Google Sign-In successful, credential:', response.credential);
        const idToken = response.credential;

        // Send the ID token to the backend
        fetch('/api/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idToken })
        })
        .then(res => {
            console.log('Backend response status:', res.status);
            return res.json();
        })
        .then(data => {
            console.log('Backend response data:', data);
            if (data.success) {
                console.log('Google login successful, storing token');
                localStorage.setItem('token', data.token);
                window.location.href = '/index.html';
            } else {
                console.error('Google login failed:', data.message);
                signinError.textContent = data.message || 'Google login failed';
                signinError.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error during backend request:', error);
            signinError.textContent = 'Failed to communicate with server. Please try again.';
            signinError.classList.remove('hidden');
        });
    };
});