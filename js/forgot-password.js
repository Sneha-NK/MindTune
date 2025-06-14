document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');

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

    // Form validation
    function validateForm() {
        let isValid = true;

        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            removeError(emailInput);
        }

        return isValid;
    }

    // Simulate password reset request
    async function simulatePasswordReset(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if the email exists in our "database" (localStorage)
                const newUser = JSON.parse(localStorage.getItem('newUser'));
                
                if (!newUser || newUser.email !== email) {
                    reject(new Error('No account found with this email address'));
                    return;
                }

                // In a real application, this would:
                // 1. Generate a password reset token
                // 2. Send an email with the reset link
                // 3. Store the token in the database with an expiration
                resolve();
            }, 1500);
        });
    }

    // Handle form submission
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Show loading state
        const submitBtn = forgotPasswordForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            await simulatePasswordReset(emailInput.value);

            // Show success message
            showMessage('Password reset instructions have been sent to your email. Redirecting to login...', 'success');

            // Clear form
            emailInput.value = '';

        } catch (error) {
            showMessage(error.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Reset Link';
        }
    });

    // Real-time email validation
    emailInput.addEventListener('input', () => {
        if (emailInput.value.trim()) {
            if (isValidEmail(emailInput.value)) {
                removeError(emailInput);
            } else {
                showError(emailInput, 'Please enter a valid email address');
            }
        } else {
            removeError(emailInput);
        }
    });
}); 