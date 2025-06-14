// Contact Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formGroups = document.querySelectorAll('.form-group');
    
    // Form validation and submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            await submitForm();
        }
    });
    
    // Real-time validation
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        if (input) {
            input.addEventListener('blur', () => {
                validateField(input);
            });
            
            input.addEventListener('input', () => {
                removeError(input);
            });
        }
    });
    
    function validateForm() {
        let isValid = true;
        const requiredFields = contactForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Validate email format
        const emailField = contactForm.querySelector('#email');
        if (emailField.value && !isValidEmail(emailField.value)) {
            showError(emailField, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate phone format (optional)
        const phoneField = contactForm.querySelector('#phone');
        if (phoneField.value && !isValidPhone(phoneField.value)) {
            showError(phoneField, 'Please enter a valid phone number');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validateField(field) {
        if (field.required && !field.value.trim()) {
            showError(field, 'This field is required');
            return false;
        }
        return true;
    }
    
    function showError(field, message) {
        removeError(field);
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    
    function removeError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        return phoneRegex.test(phone);
    }
    
    async function submitForm() {
        const submitBtn = contactForm.querySelector('.submit-btn');
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Add loading state
        submitBtn.disabled = true;
        contactForm.classList.add('loading');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            // Send email using EmailJS
            await emailjs.send(
                'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
                'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
                {
                    to_email: 'gayatrisonkatale@gmail.com',
                    from_name: data.name,
                    from_email: data.email,
                    phone: data.phone,
                    subject: data.subject,
                    message: data.message,
                    reply_to: data.email
                }
            );
            
            // Show success message
            showSuccessMessage();
            contactForm.reset();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showError(contactForm.querySelector('#email'), 'Failed to send message. Please try again later.');
            
        } finally {
            // Remove loading state
            submitBtn.disabled = false;
            contactForm.classList.remove('loading');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }
    }
    
    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>Thank You!</h3>
            <p>Your message has been sent successfully to gayatrisonkatale@gmail.com. We'll get back to you soon.</p>
        `;
        
        contactForm.insertAdjacentElement('afterend', successDiv);
        successDiv.style.display = 'block';
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
});

// Social Cards Hover Effect
const socialCards = document.querySelectorAll('.social-card');

socialCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Map Interaction
const mapContainer = document.querySelector('.map-container');
if (mapContainer) {
    mapContainer.addEventListener('click', () => {
        const iframe = mapContainer.querySelector('iframe');
        iframe.style.pointerEvents = 'auto';
    });
    
    mapContainer.addEventListener('mouseleave', () => {
        const iframe = mapContainer.querySelector('iframe');
        iframe.style.pointerEvents = 'none';
    });
}

// Contact Cards Animation
const contactCards = document.querySelectorAll('.contact-card');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

contactCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    observer.observe(card);
}); 