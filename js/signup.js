document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const signupForm = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const termsCheckbox = document.querySelector('input[name="terms"]');
    const socialButtons = document.querySelectorAll('.social-btn');

    // Password requirement elements
    const requirements = {
        length: document.getElementById('length'),
        uppercase: document.getElementById('uppercase'),
        lowercase: document.getElementById('lowercase'),
        number: document.getElementById('number'),
        special: document.getElementById('special')
    };

    // Password validation patterns
    const patterns = {
        length: /.{8,}/,
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /[0-9]/,
        special: /[!@#$%^&*(),.?":{}|<>]/
    };

    // Toggle password visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            btn.querySelector('i').classList.toggle('fa-eye');
            btn.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // Real-time password validation
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        
        // Check each requirement
        for (const [key, pattern] of Object.entries(patterns)) {
            const isValid = pattern.test(password);
            requirements[key].classList.toggle('valid', isValid);
        }

        // Check password confirmation
        if (confirmPasswordInput.value) {
            validatePasswordMatch();
        }
    });

    // Validate password match
    function validatePasswordMatch() {
        const isMatch = passwordInput.value === confirmPasswordInput.value;
        const inputGroup = confirmPasswordInput.closest('.input-group');
        
        if (confirmPasswordInput.value) {
            inputGroup.classList.toggle('error', !isMatch);
            const errorDiv = confirmPasswordInput.closest('.form-group').querySelector('.error-message');
            
            if (!isMatch) {
                if (!errorDiv) {
                    const error = document.createElement('div');
                    error.className = 'error-message';
                    error.textContent = 'Passwords do not match';
                    confirmPasswordInput.closest('.form-group').appendChild(error);
                }
            } else if (errorDiv) {
                errorDiv.remove();
            }
        }
        
        return isMatch;
    }

    // Confirm password validation
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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

    // Remove error message
    function removeError(input) {
        const formGroup = input.closest('.form-group');
        const inputGroup = input.closest('.input-group');
        inputGroup.classList.remove('error');
        
        const errorDiv = formGroup.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Show message (success/error)
    function showMessage(message, type) {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        const form = document.querySelector('.auth-form');
        form.insertBefore(messageDiv, form.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Form validation
    function validateForm() {
        let isValid = true;

        // Validate full name
        if (!fullNameInput.value.trim()) {
            showError(fullNameInput, 'Full name is required');
            isValid = false;
        } else {
            removeError(fullNameInput);
        }

        // Validate email
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            removeError(emailInput);
        }

        // Validate password
        if (!passwordInput.value) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else {
            for (const [key, pattern] of Object.entries(patterns)) {
                if (!pattern.test(passwordInput.value)) {
                    showError(passwordInput, 'Please meet all password requirements');
                    isValid = false;
                    break; // Stop further checks if one fails
                }
            }
            if (isValid) {
                removeError(passwordInput);
            }
        }

        // Validate password confirmation
        if (!confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'Please confirm your password');
            isValid = false;
        } else if (!validatePasswordMatch()) {
            isValid = false;
        }

        // Validate terms acceptance
        if (!termsCheckbox.checked) {
            showMessage('Please accept the Terms of Service and Privacy Policy', 'error');
            isValid = false;
        }

        return isValid;
    }

    // Handle form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Show loading state
        const submitBtn = signupForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Store user data (in a real app, this would be handled by the backend)
            const userData = {
                fullName: fullNameInput.value,
                email: emailInput.value,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('users', JSON.stringify(userData));

            // Show success message
            showMessage('Account created successfully! Redirecting to login...', 'success');

            // Use a configurable redirect URL
            const redirectUrl = 'login.html'; // Replace with a dynamic value if needed
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);

        } catch (error) {
            showMessage('An error occurred. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    });

    // Handle social login buttons
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.classList[1]; // google, facebook, or apple
            handleSocialSignup(provider);
        });
    });

    // Handle social signup
    function handleSocialSignup(provider) {
        const button = document.querySelector(`.social-btn.${provider}`);
        button.disabled = true;

        const originalContent = button.innerHTML;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Connecting...`;

        setTimeout(() => {
            button.disabled = false;
            button.innerHTML = originalContent;
            showMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup is not yet implemented.`, 'info');
        }, 2000);
    }

    // Real-time validation for full name
    fullNameInput.addEventListener('input', () => {
        if (fullNameInput.value.trim()) {
            removeError(fullNameInput);
        }
    });

    // Real-time validation for email
    emailInput.addEventListener('input', () => {
        if (emailInput.value.trim()) {
            if (isValidEmail(emailInput.value)) {
                removeError(emailInput);
            } else {
                showError(emailInput, 'Please enter a valid email address');
            }
        }
    });
});