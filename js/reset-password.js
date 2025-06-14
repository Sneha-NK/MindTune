document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

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

    // Show message (success/error/info)
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

        if (type === 'success') {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        }
    }

    // Check password strength
    function checkPasswordStrength(password) {
        let strength = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        // Update requirement indicators
        Object.keys(checks).forEach(key => {
            requirements[key].classList.toggle('valid', checks[key]);
            if (checks[key]) strength++;
        });

        return strength;
    }

    // Validate password match
    function validatePasswordMatch() {
        const isMatch = passwordInput.value === confirmPasswordInput.value;
        
        if (confirmPasswordInput.value) {
            if (!isMatch) {
                showError(confirmPasswordInput, 'Passwords do not match');
            } else {
                removeError(confirmPasswordInput);
            }
        }
        
        return isMatch;
    }

    // Real-time password validation
    passwordInput.addEventListener('input', () => {
        const strength = checkPasswordStrength(passwordInput.value);
        
        // Enable/disable submit button based on password strength
        const submitBtn = resetPasswordForm.querySelector('.submit-btn');
        submitBtn.disabled = strength < 5;

        // Validate password match if confirm password is not empty
        if (confirmPasswordInput.value) {
            validatePasswordMatch();
        }
    });

    // Confirm password validation
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    // Simulate password reset
    async function simulatePasswordReset(password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Get user data
                    const userData = JSON.parse(localStorage.getItem('newUser'));
                    if (!userData) {
                        reject(new Error('No user data found'));
                        return;
                    }

                    // Update password (in a real app, this would be hashed)
                    userData.password = password;
                    localStorage.setItem('newUser', JSON.stringify(userData));
                    resolve();
                } catch (error) {
                    reject(new Error('Failed to reset password'));
                }
            }, 1500);
        });
    }

    // Handle form submission
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validate password strength
        const strength = checkPasswordStrength(password);
        if (strength < 5) {
            showMessage('Please meet all password requirements', 'error');
            return;
        }

        // Validate password match
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        // Show loading state
        const submitBtn = resetPasswordForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting Password...';

        try {
            await simulatePasswordReset(password);

            // Show success message
            showMessage('Password has been reset successfully! Redirecting to login...', 'success');

            // Clear form
            passwordInput.value = '';
            confirmPasswordInput.value = '';

        } catch (error) {
            showMessage(error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-key"></i> Reset Password';
        }
    });

    // Initialize password requirements
    checkPasswordStrength(passwordInput.value);
}); 