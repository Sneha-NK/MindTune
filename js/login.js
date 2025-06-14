// Login Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const socialButtons = document.querySelectorAll('.social-btn');
    const errorMessage = document.getElementById('errorMessage');

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.querySelector('i').classList.toggle('fa-eye');
        togglePasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Form validation and submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Debugging log
        console.log('Login form submitted');

        // Perform validation
        removeErrors();
        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Debugging log
        console.log('Attempting login with email:', email);

        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Debugging log
            console.log('Retrieved users from localStorage:', users);

            if (users.length === 0) {
                console.warn('No users found in localStorage. Please ensure users are registered.');
            }

            // Find user
            const user = users["email"] == email || users["password"] == password;
            
            if (user) {
                // Debugging log
                console.log('User found:', user);

                // Set login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify({
                    name: user.name,
                    email: user.email
                }));
                
                // Show success message
                showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect to home page after a short delay
                const redirectUrl = 'ai.html'; // Replace with a dynamic value if needed
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
            } else {
                console.log('No matching user found');
                showMessage('Invalid email or password', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('An error occurred during login', 'error');
        }
    });

    // Social login handlers
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.classList[1]; // google, facebook, or apple
            handleSocialLogin(provider);
        });
    });

    // Form validation
    function validateForm() {
        let isValid = true;

        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }

        if (!passwordInput.value) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else if (passwordInput.value.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    // Show error message
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const inputGroup = input.closest('.input-group');
        inputGroup.classList.add('error');

        const existingError = formGroup.querySelector('.error-message');
        if (!existingError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            formGroup.appendChild(errorDiv);
        }
    }

    // Remove all error messages
    function removeErrors() {
        document.querySelectorAll('.error-message').forEach(error => error.remove());
        document.querySelectorAll('.input-group').forEach(group => group.classList.remove('error'));
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show message (success/error)
    function showMessage(message, type) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.className = `message ${type}`;
            errorMessage.style.display = 'block';
        }
    }

    // Simulate login API call
    async function simulateLogin() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const newUser = JSON.parse(localStorage.getItem('newUser'));
                    if (!newUser) {
                        reject(new Error('No registered user found. Please sign up first.'));
                        return;
                    }
                    if (emailInput.value === newUser.email) {
                        resolve(newUser);
                    } else {
                        reject(new Error('Invalid email or password'));
                    }
                } catch (error) {
                    reject(new Error('Error accessing user data'));
                }
            }, 1500);
        });
    }

    // Handle social login
    function handleSocialLogin(provider) {
        // In a real application, this would integrate with the respective OAuth provider
        showMessage(`Logging in with ${provider}...`, 'info');
        
        // Simulate social login process
        const button = document.querySelector(`.social-btn.${provider}`);
        button.disabled = true;
        button.style.opacity = '0.7';

        setTimeout(() => {
            button.disabled = false;
            button.style.opacity = '1';
            showMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not yet implemented.`, 'info');
        }, 2000);
    }

    // Input event listeners for real-time validation
    emailInput.addEventListener('input', () => {
        removeErrors();
        if (emailInput.value && !isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
        }
    });

    passwordInput.addEventListener('input', () => {
        removeErrors();
        if (passwordInput.value && passwordInput.value.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters');
        }
    });

    // Check for newly registered user and pre-fill email
    const newUser = JSON.parse(localStorage.getItem('newUser'));
    if (newUser && newUser.email) {
        emailInput.value = newUser.email;
        showMessage('Please log in with your newly created account', 'info');
    }
});